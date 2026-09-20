from typing import TypedDict


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
