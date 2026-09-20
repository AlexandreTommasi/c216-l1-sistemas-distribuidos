import pytest

from backend.pokedex import (
    buscar_por_nome,
    buscar_por_numero,
    eh_do_tipo,
    listar_por_tipo,
    normalizar_nome,
)


@pytest.mark.parametrize(
    "entrada, esperado",
    [
        ("pikachu", "Pikachu"),
        ("  charmander  ", "Charmander"),
        ("SQUIRTLE", "Squirtle"),
        ("bUlBaSaUr", "Bulbasaur"),
    ],
)
def test_normalizar_nome_padroniza_espacos_e_capitalizacao(entrada, esperado):
    assert normalizar_nome(entrada) == esperado


@pytest.mark.parametrize("numero, nome_esperado", [(25, "Pikachu"), (1, "Bulbasaur")])
def test_buscar_por_numero_retorna_pokemon_existente(numero, nome_esperado):
    pokemon = buscar_por_numero(numero)
    assert pokemon is not None
    assert pokemon["nome"] == nome_esperado


def test_buscar_por_numero_retorna_none_para_numero_inexistente():
    assert buscar_por_numero(9999) is None


@pytest.mark.parametrize("numero_invalido", [0, -1, 1.5, "25", None])
def test_buscar_por_numero_levanta_value_error_para_numero_invalido(numero_invalido):
    with pytest.raises(ValueError):
        buscar_por_numero(numero_invalido)


def test_buscar_por_nome_encontra_pokemon_ignorando_espacos_e_capitalizacao():
    pokemon = buscar_por_nome("  pikachu  ")
    assert pokemon is not None
    assert pokemon["numero"] == 25


def test_buscar_por_nome_retorna_none_para_nome_inexistente():
    assert buscar_por_nome("Mewtwo") is None


def test_listar_por_tipo_retorna_apenas_pokemon_do_tipo_informado():
    fogo = listar_por_tipo("fogo")
    assert len(fogo) == 1
    assert fogo[0]["nome"] == "Charmander"


def test_eh_do_tipo_reconhece_pokemon_com_multiplos_tipos():
    jigglypuff = buscar_por_nome("Jigglypuff")
    assert eh_do_tipo(jigglypuff, "fada") is True
    assert eh_do_tipo(jigglypuff, "eletrico") is False
