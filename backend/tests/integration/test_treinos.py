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
