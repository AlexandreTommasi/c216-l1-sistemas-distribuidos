import pytest

pytestmark = pytest.mark.integration


def _setup_base(client):
    ex_id = client.post(
        "/exercicios", json={"nome": "Supino", "grupo_muscular": "peito"}
    ).json()["id"]
    t_id = client.post("/treinos", json={"nome": "Push"}).json()["id"]
    return ex_id, t_id


def _cria_sessao_com_serie(client, t_id, ex_id, data, carga, tipo="valida"):
    s_id = client.post("/sessoes", json={"treino_id": t_id, "data": data}).json()["id"]
    client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": ex_id, "carga_kg": carga, "repeticoes": 10, "tipo": tipo},
    )
    return s_id


def test_comparacao_duas_sessoes(client):
    ex_id, t_id = _setup_base(client)

    _cria_sessao_com_serie(client, t_id, ex_id, "2024-01-01", 80)
    s2_id = _cria_sessao_com_serie(client, t_id, ex_id, "2024-02-01", 100)

    r = client.get(f"/sessoes/{s2_id}/comparacao")
    assert r.status_code == 200

    body = r.json()
    assert body["treino"] == "Push"
    ex = body["exercicios"][0]
    assert ex["status"] == "evoluiu"
    assert float(ex["carga_maxima_kg"]) == 100.0
    assert float(ex["delta"]["carga_kg"]) == 20.0
    assert ex["delta"]["carga_pct"] > 0
    assert float(ex["recorde_pessoal_kg"]) == 100.0
    assert ex["eh_recorde"] is True


def test_aquecimento_excluido_do_calculo(client):
    ex_id, t_id = _setup_base(client)

    s_id = client.post(
        "/sessoes", json={"treino_id": t_id, "data": "2024-03-01"}
    ).json()["id"]
    # Aquecimento com carga alta — NÃO deve entrar no cálculo
    client.post(
        f"/sessoes/{s_id}/series",
        json={
            "exercicio_id": ex_id,
            "carga_kg": 200,
            "repeticoes": 15,
            "tipo": "aquecimento",
        },
    )
    # Série válida com carga menor
    client.post(
        f"/sessoes/{s_id}/series",
        json={
            "exercicio_id": ex_id,
            "carga_kg": 100,
            "repeticoes": 10,
            "tipo": "valida",
        },
    )

    r = client.get(f"/sessoes/{s_id}/comparacao")
    assert r.status_code == 200

    ex = r.json()["exercicios"][0]
    assert float(ex["carga_maxima_kg"]) == 100.0
    assert ex["repeticoes_totais"] == 10


def test_historico_exercicio(client):
    ex_id, t_id = _setup_base(client)

    for data, carga in [
        ("2024-01-15", 60),
        ("2024-02-15", 70),
        ("2024-03-15", 80),
    ]:
        _cria_sessao_com_serie(client, t_id, ex_id, data, carga)

    r = client.get(f"/exercicios/{ex_id}/historico")
    assert r.status_code == 200

    pontos = r.json()
    assert len(pontos) == 3
    assert float(pontos[0]["carga_maxima_kg"]) == 60.0
    assert float(pontos[-1]["carga_maxima_kg"]) == 80.0


def test_comparacao_404_sessao_inexistente(client):
    r = client.get("/sessoes/9999/comparacao")
    assert r.status_code == 404


def test_historico_404_exercicio_inexistente(client):
    r = client.get("/exercicios/9999/historico")
    assert r.status_code == 404


def test_comparacao_isola_cada_exercicio_da_sessao(client):
    # Regressao: a execucao anterior vinha agregada da sessao anterior INTEIRA,
    # entao um exercicio leve era comparado contra a carga do exercicio pesado
    # feito no mesmo dia, e todo mundo aparecia regredindo.
    pesado = client.post(
        "/exercicios",
        json={"nome": "Agachamento regressao", "grupo_muscular": "pernas"},
    ).json()["id"]
    leve = client.post(
        "/exercicios",
        json={"nome": "Bulgaro regressao", "grupo_muscular": "pernas"},
    ).json()["id"]
    t_id = client.post("/treinos", json={"nome": "Legs regressao"}).json()["id"]

    def cria(data, carga_pesado, carga_leve):
        s_id = client.post("/sessoes", json={"treino_id": t_id, "data": data}).json()[
            "id"
        ]
        for exercicio_id, carga in ((pesado, carga_pesado), (leve, carga_leve)):
            client.post(
                f"/sessoes/{s_id}/series",
                json={
                    "exercicio_id": exercicio_id,
                    "carga_kg": carga,
                    "repeticoes": 8,
                    "tipo": "valida",
                },
            )
        return s_id

    cria("2024-05-01", 150, 20)
    s2_id = cria("2024-05-08", 160, 22.5)

    body = client.get(f"/sessoes/{s2_id}/comparacao").json()
    por_id = {e["exercicio_id"]: e for e in body["exercicios"]}

    assert float(por_id[pesado]["sessao_anterior"]["carga_maxima_kg"]) == 150.0
    assert float(por_id[pesado]["delta"]["carga_kg"]) == 10.0
    assert por_id[pesado]["status"] == "evoluiu"

    assert float(por_id[leve]["sessao_anterior"]["carga_maxima_kg"]) == 20.0
    assert float(por_id[leve]["delta"]["carga_kg"]) == 2.5
    assert por_id[leve]["sessao_anterior"]["repeticoes_totais"] == 8
    assert por_id[leve]["status"] == "evoluiu"
