import pytest


@pytest.mark.parametrize(
    "numero, nome_esperado",
    [(25, "Pikachu"), (1, "Bulbasaur"), (143, "Snorlax")],
)
def test_get_pokemon_por_numero_retorna_pokemon_correto(client, numero, nome_esperado):
    resposta = client.get(f"/pokemon/{numero}")

    assert resposta.status_code == 200
    assert resposta.json()["nome"] == nome_esperado


def test_get_pokemon_com_numero_inexistente_retorna_404(client):
    resposta = client.get("/pokemon/9999")

    assert resposta.status_code == 404


@pytest.mark.parametrize("numero_invalido", ["abc", "-1", "0", "1.5"])
def test_get_pokemon_com_numero_invalido_retorna_422(client, numero_invalido):
    resposta = client.get(f"/pokemon/{numero_invalido}")

    assert resposta.status_code == 422


def test_get_pokemon_por_tipo_retorna_apenas_pokemon_daquele_tipo(client):
    resposta = client.get("/pokemon", params={"tipo": "fogo"})

    assert resposta.status_code == 200
    pokemons = resposta.json()
    assert len(pokemons) == 1
    assert pokemons[0]["nome"] == "Charmander"


def test_get_pokemon_sem_filtro_de_tipo_retorna_todos_os_pokemon(client):
    resposta = client.get("/pokemon")

    assert resposta.status_code == 200
    assert len(resposta.json()) == 6
