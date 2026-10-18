from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from backend.database.session import get_db
from backend.schemas.pokemon import (
    PokemonBase,
    PokemonCreate,
    PokemonResponse,
    PokemonUpdate,
)
from backend.services import pokemon as pokemon_service

router = APIRouter(prefix="/pokemon", tags=["pokemon"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[PokemonResponse])
def list_pokemon(db: DbSession, tipo: str | None = None):
    return pokemon_service.listar(db, tipo)


@router.get("/{numero}", response_model=PokemonResponse)
def get_pokemon(db: DbSession, numero: Annotated[int, Path(gt=0)]):
    pokemon = pokemon_service.buscar_por_numero(db, numero)
    if pokemon is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return pokemon


@router.post("", response_model=PokemonResponse, status_code=201)
def create_pokemon(db: DbSession, data: PokemonCreate):
    try:
        return pokemon_service.criar(db, data)
    except ValueError:
        raise HTTPException(status_code=409, detail="numero ja existe")


@router.put("/{numero}", response_model=PokemonResponse)
def replace_pokemon(
    db: DbSession,
    numero: Annotated[int, Path(gt=0)],
    data: Annotated[PokemonBase, Body()],
):
    result = pokemon_service.substituir(db, numero, data)
    if result is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return result


@router.patch("/{numero}", response_model=PokemonResponse)
def update_pokemon(
    db: DbSession,
    numero: Annotated[int, Path(gt=0)],
    data: Annotated[PokemonUpdate, Body()],
):
    result = pokemon_service.atualizar(db, numero, data)
    if result is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return result


@router.delete("/{numero}", status_code=204)
def delete_pokemon(db: DbSession, numero: Annotated[int, Path(gt=0)]):
    removed = pokemon_service.remover(db, numero)
    if not removed:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
