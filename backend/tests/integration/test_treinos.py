import pytest

pytestmark = pytest.mark.integration


def test_crud_completo(client):
    r = client.post("/treinos", json={"nome": "Treino A"})
    assert r.status_code == 201
    id_ = r.json()["id"]
    assert r.json()["nome"] == "Treino A"

    r = client.get("/treinos")
    assert r.status_code == 200
    assert any(t["id"] == id_ for t in r.json())

    r = client.get(f"/treinos/{id_}")
    assert r.status_code == 200
    assert r.json()["nome"] == "Treino A"

    r = client.patch(f"/treinos/{id_}", json={"nome": "Treino B"})
    assert r.status_code == 200
    assert r.json()["nome"] == "Treino B"

    r = client.delete(f"/treinos/{id_}")
    assert r.status_code == 204

    r = client.get(f"/treinos/{id_}")
    assert r.status_code == 404


def test_404_id_inexistente(client):
    r = client.get("/treinos/9999")
    assert r.status_code == 404
    assert "9999" in r.json()["detail"]


def test_422_payload_invalido(client):
    r = client.post("/treinos", json={"nome": ""})
    assert r.status_code == 422


def test_sugestao_treino_sem_sessao_devolve_lista_vazia(client):
    t_id = client.post("/treinos", json={"nome": "Treino Sem Sessao"}).json()["id"]
    r = client.get(f"/treinos/{t_id}/sugestao")
    assert r.status_code == 200
    assert r.json() == []


def test_sugestao_treino_com_historico(client):
    ex_id = client.post(
        "/exercicios", json={"nome": "Supino Sugestao Int", "grupo_muscular": "peito"}
    ).json()["id"]
    t_id = client.post("/treinos", json={"nome": "Treino Sugestao Hist"}).json()["id"]
    s_id = client.post(
        "/sessoes", json={"treino_id": t_id, "data": "2024-03-01"}
    ).json()["id"]
    client.post(
        f"/sessoes/{s_id}/series",
        json={
            "exercicio_id": ex_id,
            "carga_kg": 80,
            "repeticoes": 10,
            "tipo": "valida",
        },
    )
    client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": ex_id, "carga_kg": 85, "repeticoes": 8, "tipo": "valida"},
    )

    r = client.get(f"/treinos/{t_id}/sugestao")
    assert r.status_code == 200
    dados = r.json()
    assert len(dados) == 1
    assert dados[0]["exercicio_id"] == ex_id
    assert float(dados[0]["carga_kg"]) == 85.0
    assert dados[0]["repeticoes"] == 8
    assert dados[0]["series_validas"] == 2


def test_sugestao_ultima_sessao_so_aquecimento_devolve_vazio(client):
    ex_id = client.post(
        "/exercicios", json={"nome": "Supino Aquec Int", "grupo_muscular": "peito"}
    ).json()["id"]
    t_id = client.post("/treinos", json={"nome": "Treino Aquec Hist"}).json()["id"]
    s_id = client.post(
        "/sessoes", json={"treino_id": t_id, "data": "2024-04-01"}
    ).json()["id"]
    client.post(
        f"/sessoes/{s_id}/series",
        json={
            "exercicio_id": ex_id,
            "carga_kg": 20,
            "repeticoes": 15,
            "tipo": "aquecimento",
        },
    )

    r = client.get(f"/treinos/{t_id}/sugestao")
    assert r.status_code == 200
    assert r.json() == []
