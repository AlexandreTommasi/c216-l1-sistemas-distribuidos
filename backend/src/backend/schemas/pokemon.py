from pydantic import BaseModel


class PokemonBase(BaseModel):
    nome: str
    tipos: list[str]


class PokemonCreate(PokemonBase):
    numero: int


class PokemonUpdate(BaseModel):
    nome: str | None = None
    tipos: list[str] | None = None


class PokemonResponse(PokemonBase):
    numero: int
