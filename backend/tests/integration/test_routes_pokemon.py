import pytest

pytestmark = pytest.mark.integration


# ---------------------------------------------------------------------------
# GET /pokemon
# ---------------------------------------------------------------------------


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


def test_get_pokemon_sem_filtro_retorna_todos(client):
    resposta = client.get("/pokemon")

    assert resposta.status_code == 200
    assert len(resposta.json()) == 6


# ---------------------------------------------------------------------------
# POST /pokemon
# ---------------------------------------------------------------------------


def test_post_pokemon_cria_novo_e_retorna_201(client):
    payload = {"numero": 150, "nome": "Mewtwo", "tipos": ["Psiquico"]}
    resposta = client.post("/pokemon", json=payload)

    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["numero"] == 150
    assert corpo["nome"] == "Mewtwo"


def test_post_pokemon_retorna_409_quando_numero_ja_existe(client):
    payload = {"numero": 25, "nome": "Pikachu2", "tipos": ["Eletrico"]}
    resposta = client.post("/pokemon", json=payload)

    assert resposta.status_code == 409


def test_post_pokemon_retorna_422_quando_corpo_invalido(client):
    resposta = client.post("/pokemon", json={"nome": "SemNumero", "tipos": []})

    assert resposta.status_code == 422


def test_post_pokemon_aparece_no_get_subsequente(client):
    payload = {"numero": 151, "nome": "Mew", "tipos": ["Psiquico"]}
    client.post("/pokemon", json=payload)

    resposta = client.get("/pokemon/151")
    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "Mew"


# ---------------------------------------------------------------------------
# PUT /pokemon/{numero}
# ---------------------------------------------------------------------------


def test_put_pokemon_substitui_completamente(client):
    payload = {"nome": "Raichu", "tipos": ["Eletrico"]}
    resposta = client.put("/pokemon/25", json=payload)

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["nome"] == "Raichu"
    assert corpo["numero"] == 25


def test_put_pokemon_retorna_404_quando_nao_existe(client):
    resposta = client.put("/pokemon/9999", json={"nome": "X", "tipos": []})

    assert resposta.status_code == 404


def test_put_pokemon_retorna_422_para_numero_invalido_no_path(client):
    resposta = client.put("/pokemon/0", json={"nome": "X", "tipos": []})

    assert resposta.status_code == 422


# ---------------------------------------------------------------------------
# PATCH /pokemon/{numero}
# ---------------------------------------------------------------------------


def test_patch_pokemon_atualiza_apenas_nome(client):
    resposta = client.patch("/pokemon/25", json={"nome": "Pikachu EX"})

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["nome"] == "Pikachu EX"
    assert corpo["tipos"] == ["Eletrico"]


def test_patch_pokemon_atualiza_apenas_tipos(client):
    resposta = client.patch("/pokemon/25", json={"tipos": ["Eletrico", "Voador"]})

    assert resposta.status_code == 200
    assert resposta.json()["tipos"] == ["Eletrico", "Voador"]


def test_patch_pokemon_retorna_404_quando_nao_existe(client):
    resposta = client.patch("/pokemon/9999", json={"nome": "X"})

    assert resposta.status_code == 404


# ---------------------------------------------------------------------------
# DELETE /pokemon/{numero}
# ---------------------------------------------------------------------------


def test_delete_pokemon_remove_e_retorna_204(client):
    resposta = client.delete("/pokemon/25")

    assert resposta.status_code == 204


def test_delete_pokemon_torna_recurso_inacessivel(client):
    client.delete("/pokemon/25")
    resposta = client.get("/pokemon/25")

    assert resposta.status_code == 404


def test_delete_pokemon_retorna_404_quando_nao_existe(client):
    resposta = client.delete("/pokemon/9999")

    assert resposta.status_code == 404


def test_delete_pokemon_retorna_422_para_numero_invalido_no_path(client):
    resposta = client.delete("/pokemon/-1")

    assert resposta.status_code == 422
