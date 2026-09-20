from fastapi import APIRouter, HTTPException

from backend.schemas.pokemon import Pokemon
from backend.services import pokemon as pokemon_service

router = APIRouter(prefix="/pokemon", tags=["pokemon"])


@router.get("/{numero}", response_model=Pokemon)
def get_pokemon(numero: int):
    try:
        pokemon = pokemon_service.buscar_por_numero(numero)
    except ValueError:
        raise HTTPException(status_code=422, detail="numero invalido")
    if pokemon is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return pokemon


@router.get("", response_model=list[Pokemon])
def list_pokemon(tipo: str | None = None):
    if tipo is None:
        return list(pokemon_service.POKEDEX.values())
    return pokemon_service.listar_por_tipo(tipo)
