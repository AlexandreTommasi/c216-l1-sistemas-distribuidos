from typing import Annotated

from fastapi import APIRouter, Body, HTTPException, Path

from backend.schemas.pokemon import (
    PokemonBase,
    PokemonCreate,
    PokemonResponse,
    PokemonUpdate,
)
from backend.services import pokemon as pokemon_service

router = APIRouter(prefix="/pokemon", tags=["pokemon"])


@router.get("", response_model=list[PokemonResponse])
def list_pokemon(tipo: str | None = None):
    if tipo is None:
        return list(pokemon_service.POKEDEX.values())
    return pokemon_service.listar_por_tipo(tipo)


@router.get("/{numero}", response_model=PokemonResponse)
def get_pokemon(numero: Annotated[int, Path(gt=0)]):
    pokemon = pokemon_service.POKEDEX.get(numero)
    if pokemon is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return pokemon


@router.post("", response_model=PokemonResponse, status_code=201)
def create_pokemon(data: PokemonCreate):
    try:
        return pokemon_service.criar(data)
    except ValueError:
        raise HTTPException(status_code=409, detail="numero ja existe")


@router.put("/{numero}", response_model=PokemonResponse)
def replace_pokemon(
    numero: Annotated[int, Path(gt=0)],
    data: Annotated[PokemonBase, Body()],
):
    result = pokemon_service.substituir(numero, data)
    if result is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return result


@router.patch("/{numero}", response_model=PokemonResponse)
def update_pokemon(
    numero: Annotated[int, Path(gt=0)],
    data: Annotated[PokemonUpdate, Body()],
):
    result = pokemon_service.atualizar(numero, data)
    if result is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return result


@router.delete("/{numero}", status_code=204)
def delete_pokemon(numero: Annotated[int, Path(gt=0)]):
    removed = pokemon_service.remover(numero)
    if not removed:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
