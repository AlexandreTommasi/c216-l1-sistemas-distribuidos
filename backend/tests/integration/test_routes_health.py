import pytest

pytestmark = pytest.mark.integration


def test_health_retorna_200_e_estado_up(client):
    resposta = client.get("/health")

    assert resposta.status_code == 200
    assert resposta.json() == {"service": "backend", "state": "up"}


def test_info_retorna_200_e_metadados_da_disciplina(client):
    resposta = client.get("/info")

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["disciplina"] == "C216 - Sistemas Distribuidos"
    assert corpo["instituicao"] == "INATEL"
    assert corpo["periodo"] == "2026.2"
