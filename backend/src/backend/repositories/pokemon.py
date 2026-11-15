from sqlalchemy import any_, select
from sqlalchemy.orm import Session

from backend.models.pokemon import Pokemon


def get_by_numero(db: Session, numero: int) -> Pokemon | None:
    return db.get(Pokemon, numero)


def get_by_nome(db: Session, nome: str) -> Pokemon | None:
    return db.scalars(select(Pokemon).where(Pokemon.nome == nome)).first()


def list_all(db: Session) -> list[Pokemon]:
    return list(db.scalars(select(Pokemon).order_by(Pokemon.numero)))


def list_by_tipo(db: Session, tipo: str) -> list[Pokemon]:
    query = select(Pokemon).where(tipo == any_(Pokemon.tipos)).order_by(Pokemon.numero)
    return list(db.scalars(query))


def create(db: Session, numero: int, nome: str, tipos: list[str]) -> Pokemon:
    pokemon = Pokemon(numero=numero, nome=nome, tipos=tipos)
    db.add(pokemon)
    db.commit()
    return pokemon


def update(db: Session, pokemon: Pokemon, nome: str, tipos: list[str]) -> Pokemon:
    pokemon.nome = nome
    pokemon.tipos = tipos
    db.commit()
    return pokemon


def delete(db: Session, pokemon: Pokemon) -> None:
    db.delete(pokemon)
    db.commit()
