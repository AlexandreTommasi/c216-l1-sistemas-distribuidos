import pytest

pytestmark = pytest.mark.integration

_PAYLOAD = {"nome": "Supino Reto", "grupo_muscular": "peito"}


def test_crud_completo(client):
    r = client.post("/exercicios", json=_PAYLOAD)
    assert r.status_code == 201
    id_ = r.json()["id"]
    assert r.json()["nome"] == "Supino Reto"

    r = client.get("/exercicios")
    assert r.status_code == 200
    assert any(e["id"] == id_ for e in r.json())

    r = client.get(f"/exercicios/{id_}")
    assert r.status_code == 200
    assert r.json()["nome"] == "Supino Reto"

    r = client.patch(f"/exercicios/{id_}", json={"nome": "Supino Inclinado"})
    assert r.status_code == 200
    assert r.json()["nome"] == "Supino Inclinado"

    r = client.delete(f"/exercicios/{id_}")
    assert r.status_code == 204

    r = client.get(f"/exercicios/{id_}")
    assert r.status_code == 404


def test_404_id_inexistente(client):
    r = client.get("/exercicios/9999")
    assert r.status_code == 404
    assert "9999" in r.json()["detail"]


def test_409_nome_duplicado(client):
    client.post("/exercicios", json=_PAYLOAD)
    r = client.post(
        "/exercicios", json={"nome": "SUPINO RETO", "grupo_muscular": "peito"}
    )
    assert r.status_code == 409


def test_409_remover_com_series(client):
    ex_id = client.post("/exercicios", json=_PAYLOAD).json()["id"]
    t_id = client.post("/treinos", json={"nome": "Push"}).json()["id"]
    s_id = client.post(
        "/sessoes", json={"treino_id": t_id, "data": "2024-01-10"}
    ).json()["id"]
    client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": ex_id, "carga_kg": 80, "repeticoes": 10},
    )
    r = client.delete(f"/exercicios/{ex_id}")
    assert r.status_code == 409


def test_422_payload_invalido(client):
    r = client.post("/exercicios", json={"nome": "", "grupo_muscular": "invalido"})
    assert r.status_code == 422
