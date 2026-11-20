import pytest

from overload.models.serie import Serie

pytestmark = pytest.mark.integration

_DATA1 = "2024-01-10"
_DATA2 = "2024-01-20"


def _cria_treino_e_exercicio(client):
    t_id = client.post("/treinos", json={"nome": "Treino A"}).json()["id"]
    ex_id = client.post(
        "/exercicios", json={"nome": "Supino", "grupo_muscular": "peito"}
    ).json()["id"]
    return t_id, ex_id


def test_crud_completo(client):
    t_id, _ = _cria_treino_e_exercicio(client)

    r = client.post("/sessoes", json={"treino_id": t_id, "data": _DATA1})
    assert r.status_code == 201
    id_ = r.json()["id"]
    assert r.json()["data"] == _DATA1

    r = client.get("/sessoes")
    assert r.status_code == 200
    assert any(s["id"] == id_ for s in r.json())

    r = client.get(f"/sessoes/{id_}")
    assert r.status_code == 200
    assert r.json()["treino_nome"] == "Treino A"
    assert "series" in r.json()

    r = client.patch(f"/sessoes/{id_}", json={"data": _DATA2})
    assert r.status_code == 200
    assert r.json()["data"] == _DATA2

    r = client.delete(f"/sessoes/{id_}")
    assert r.status_code == 204

    r = client.get(f"/sessoes/{id_}")
    assert r.status_code == 404


def test_404_treino_inexistente(client):
    r = client.post("/sessoes", json={"treino_id": 9999, "data": _DATA1})
    assert r.status_code == 404


def test_409_sessao_duplicada(client):
    t_id, _ = _cria_treino_e_exercicio(client)
    client.post("/sessoes", json={"treino_id": t_id, "data": _DATA1})
    r = client.post("/sessoes", json={"treino_id": t_id, "data": _DATA1})
    assert r.status_code == 409


def test_delete_cascata_series(client, db):
    t_id, ex_id = _cria_treino_e_exercicio(client)
    s_id = client.post("/sessoes", json={"treino_id": t_id, "data": _DATA1}).json()[
        "id"
    ]
    serie_id = client.post(
        f"/sessoes/{s_id}/series",
        json={"exercicio_id": ex_id, "carga_kg": 60, "repeticoes": 10},
    ).json()["id"]

    assert db.get(Serie, serie_id) is not None

    r = client.delete(f"/sessoes/{s_id}")
    assert r.status_code == 204

    db.expire_all()
    assert db.get(Serie, serie_id) is None


def test_detalhe_traz_series(client):
    t_id, ex_id = _cria_treino_e_exercicio(client)
    s_id = client.post("/sessoes", json={"treino_id": t_id, "data": _DATA1}).json()[
        "id"
    ]

    for _ in range(2):
        client.post(
            f"/sessoes/{s_id}/series",
            json={"exercicio_id": ex_id, "carga_kg": 80, "repeticoes": 10},
        )

    r = client.get(f"/sessoes/{s_id}")
    assert r.status_code == 200
    assert len(r.json()["series"]) == 2
