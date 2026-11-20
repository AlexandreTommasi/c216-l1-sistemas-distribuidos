import pytest

pytestmark = pytest.mark.integration


def _setup(client):
    t_id = client.post("/treinos", json={"nome": "Treino B"}).json()["id"]
    ex_id = client.post(
        "/exercicios", json={"nome": "Agachamento", "grupo_muscular": "pernas"}
    ).json()["id"]
    s_id = client.post(
        "/sessoes", json={"treino_id": t_id, "data": "2024-02-01"}
    ).json()["id"]
    return s_id, ex_id


def test_post_patch_delete(client):
    s_id, ex_id = _setup(client)

    r = client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": ex_id, "carga_kg": 100, "repeticoes": 8},
    )
    assert r.status_code == 201
    serie_id = r.json()["id"]
    assert r.json()["ordem"] == 1

    r = client.patch(f"/series/{serie_id}", json={"repeticoes": 10})
    assert r.status_code == 200
    assert r.json()["repeticoes"] == 10

    r = client.delete(f"/series/{serie_id}")
    assert r.status_code == 204


def test_ordem_auto_incrementa(client):
    s_id, ex_id = _setup(client)
    dados = {"exercicio_id": ex_id, "carga_kg": 50, "repeticoes": 12}

    r1 = client.post(f"/sessoes/{s_id}/series", json=dados)
    r2 = client.post(f"/sessoes/{s_id}/series", json=dados)

    assert r1.json()["ordem"] == 1
    assert r2.json()["ordem"] == 2


def test_404_sessao_inexistente(client):
    ex_id = client.post(
        "/exercicios", json={"nome": "Rosca", "grupo_muscular": "biceps"}
    ).json()["id"]
    r = client.post(
        "/sessoes/9999/series",
        json={"exercicio_id": ex_id, "carga_kg": 20, "repeticoes": 10},
    )
    assert r.status_code == 404


def test_404_exercicio_inexistente(client):
    t_id = client.post("/treinos", json={"nome": "X"}).json()["id"]
    s_id = client.post(
        "/sessoes", json={"treino_id": t_id, "data": "2024-03-01"}
    ).json()["id"]
    r = client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": 9999, "carga_kg": 20, "repeticoes": 10},
    )
    assert r.status_code == 404


def test_422_carga_invalida(client):
    s_id, ex_id = _setup(client)
    r = client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": ex_id, "carga_kg": 0, "repeticoes": 10},
    )
    assert r.status_code == 422
