import pytest

from backend.schemas.pokemon import PokemonBase, PokemonCreate, PokemonUpdate
from backend.services.pokemon import (
    atualizar,
    buscar_por_nome,
    buscar_por_numero,
    criar,
    eh_do_tipo,
    listar_por_tipo,
    normalizar_nome,
    remover,
    substituir,
)

pytestmark = pytest.mark.unit


# ---------------------------------------------------------------------------
# normalizar_nome
# ---------------------------------------------------------------------------


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


# ---------------------------------------------------------------------------
# buscar_por_numero
# ---------------------------------------------------------------------------


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


# ---------------------------------------------------------------------------
# buscar_por_nome
# ---------------------------------------------------------------------------


def test_buscar_por_nome_encontra_pokemon_ignorando_espacos_e_capitalizacao():
    pokemon = buscar_por_nome("  pikachu  ")
    assert pokemon is not None
    assert pokemon["numero"] == 25


def test_buscar_por_nome_retorna_none_para_nome_inexistente():
    assert buscar_por_nome("Mewtwo") is None


# ---------------------------------------------------------------------------
# listar_por_tipo / eh_do_tipo
# ---------------------------------------------------------------------------


def test_listar_por_tipo_retorna_apenas_pokemon_do_tipo_informado():
    fogo = listar_por_tipo("fogo")
    assert len(fogo) == 1
    assert fogo[0]["nome"] == "Charmander"


def test_eh_do_tipo_reconhece_pokemon_com_multiplos_tipos():
    jigglypuff = buscar_por_nome("Jigglypuff")
    assert eh_do_tipo(jigglypuff, "fada") is True
    assert eh_do_tipo(jigglypuff, "eletrico") is False


# ---------------------------------------------------------------------------
# criar
# ---------------------------------------------------------------------------


def test_criar_insere_e_retorna_novo_pokemon():
    data = PokemonCreate(numero=150, nome="Mewtwo", tipos=["Psiquico"])
    resultado = criar(data)
    assert resultado["numero"] == 150
    assert resultado["nome"] == "Mewtwo"
    assert resultado["tipos"] == ["Psiquico"]


def test_criar_levanta_value_error_quando_numero_ja_existe():
    data = PokemonCreate(numero=25, nome="Pikachu2", tipos=["Eletrico"])
    with pytest.raises(ValueError):
        criar(data)


# ---------------------------------------------------------------------------
# substituir
# ---------------------------------------------------------------------------


def test_substituir_atualiza_completamente_pokemon_existente():
    data = PokemonBase(nome="Raichu", tipos=["Eletrico"])
    resultado = substituir(25, data)
    assert resultado is not None
    assert resultado["nome"] == "Raichu"
    assert resultado["numero"] == 25


def test_substituir_retorna_none_para_numero_inexistente():
    data = PokemonBase(nome="MissingNo", tipos=[])
    assert substituir(9999, data) is None


# ---------------------------------------------------------------------------
# atualizar
# ---------------------------------------------------------------------------


def test_atualizar_altera_apenas_os_campos_fornecidos():
    data = PokemonUpdate(nome="Pikachu EX")
    resultado = atualizar(25, data)
    assert resultado is not None
    assert resultado["nome"] == "Pikachu EX"
    assert resultado["tipos"] == ["Eletrico"]


def test_atualizar_retorna_none_para_numero_inexistente():
    assert atualizar(9999, PokemonUpdate(nome="X")) is None


# ---------------------------------------------------------------------------
# remover
# ---------------------------------------------------------------------------


def test_remover_exclui_pokemon_existente_e_retorna_true():
    assert remover(25) is True
    assert buscar_por_numero(25) is None


def test_remover_retorna_false_para_numero_inexistente():
    assert remover(9999) is False
