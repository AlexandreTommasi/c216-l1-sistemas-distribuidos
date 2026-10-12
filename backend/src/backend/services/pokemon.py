from typing import TypedDict

from backend.schemas.pokemon import PokemonBase, PokemonCreate, PokemonUpdate


class Pokemon(TypedDict):
    numero: int
    nome: str
    tipos: list[str]


POKEDEX: dict[int, Pokemon] = {
    1: {"numero": 1, "nome": "Bulbasaur", "tipos": ["Grama", "Veneno"]},
    4: {"numero": 4, "nome": "Charmander", "tipos": ["Fogo"]},
    7: {"numero": 7, "nome": "Squirtle", "tipos": ["Agua"]},
    25: {"numero": 25, "nome": "Pikachu", "tipos": ["Eletrico"]},
    39: {"numero": 39, "nome": "Jigglypuff", "tipos": ["Normal", "Fada"]},
    143: {"numero": 143, "nome": "Snorlax", "tipos": ["Normal"]},
}


def normalizar_nome(nome: str) -> str:
    return nome.strip().capitalize()


def buscar_por_numero(numero: int) -> Pokemon | None:
    if not isinstance(numero, int) or isinstance(numero, bool) or numero <= 0:
        raise ValueError("numero deve ser um inteiro positivo")
    return POKEDEX.get(numero)


def buscar_por_nome(nome: str) -> Pokemon | None:
    nome_normalizado = normalizar_nome(nome)
    for pokemon in POKEDEX.values():
        if pokemon["nome"] == nome_normalizado:
            return pokemon
    return None


def listar_por_tipo(tipo: str) -> list[Pokemon]:
    return [pokemon for pokemon in POKEDEX.values() if eh_do_tipo(pokemon, tipo)]


def eh_do_tipo(pokemon: Pokemon, tipo: str) -> bool:
    tipo_normalizado = normalizar_nome(tipo)
    return tipo_normalizado in pokemon["tipos"]


def criar(data: PokemonCreate) -> Pokemon:
    if data.numero in POKEDEX:
        raise ValueError("numero ja existe")
    entry: Pokemon = {"numero": data.numero, "nome": data.nome, "tipos": data.tipos}
    POKEDEX[data.numero] = entry
    return entry


def substituir(numero: int, data: PokemonBase) -> Pokemon | None:
    if numero not in POKEDEX:
        return None
    POKEDEX[numero] = {"numero": numero, "nome": data.nome, "tipos": data.tipos}
    return POKEDEX[numero]


def atualizar(numero: int, data: PokemonUpdate) -> Pokemon | None:
    if numero not in POKEDEX:
        return None
    if data.nome is not None:
        POKEDEX[numero]["nome"] = data.nome
    if data.tipos is not None:
        POKEDEX[numero]["tipos"] = data.tipos
    return POKEDEX[numero]


def remover(numero: int) -> bool:
    if numero not in POKEDEX:
        return False
    del POKEDEX[numero]
    return True
