from sqlalchemy.orm import Session

from backend.models.pokemon import Pokemon
from backend.repositories import pokemon as repository
from backend.schemas.pokemon import PokemonBase, PokemonCreate, PokemonUpdate


def normalizar_nome(nome: str) -> str:
    return nome.strip().capitalize()


def listar(db: Session, tipo: str | None = None) -> list[Pokemon]:
    if tipo is None:
        return repository.list_all(db)
    return listar_por_tipo(db, tipo)


def buscar_por_numero(db: Session, numero: int) -> Pokemon | None:
    if not isinstance(numero, int) or isinstance(numero, bool) or numero <= 0:
        raise ValueError("numero deve ser um inteiro positivo")
    return repository.get_by_numero(db, numero)


def buscar_por_nome(db: Session, nome: str) -> Pokemon | None:
    return repository.get_by_nome(db, normalizar_nome(nome))


def listar_por_tipo(db: Session, tipo: str) -> list[Pokemon]:
    return repository.list_by_tipo(db, normalizar_nome(tipo))


def eh_do_tipo(pokemon: Pokemon, tipo: str) -> bool:
    return normalizar_nome(tipo) in pokemon.tipos


def criar(db: Session, data: PokemonCreate) -> Pokemon:
    if repository.get_by_numero(db, data.numero) is not None:
        raise ValueError("numero ja existe")
    return repository.create(db, data.numero, data.nome, data.tipos)


def substituir(db: Session, numero: int, data: PokemonBase) -> Pokemon | None:
    pokemon = repository.get_by_numero(db, numero)
    if pokemon is None:
        return None
    return repository.update(db, pokemon, data.nome, data.tipos)


def atualizar(db: Session, numero: int, data: PokemonUpdate) -> Pokemon | None:
    pokemon = repository.get_by_numero(db, numero)
    if pokemon is None:
        return None
    nome = data.nome if data.nome is not None else pokemon.nome
    tipos = data.tipos if data.tipos is not None else pokemon.tipos
    return repository.update(db, pokemon, nome, tipos)


def remover(db: Session, numero: int) -> bool:
    pokemon = repository.get_by_numero(db, numero)
    if pokemon is None:
        return False
    repository.delete(db, pokemon)
    return True
