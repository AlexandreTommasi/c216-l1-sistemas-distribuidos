from pydantic import BaseModel, ConfigDict


class PokemonBase(BaseModel):
    nome: str
    tipos: list[str]


class PokemonCreate(PokemonBase):
    numero: int


class PokemonUpdate(BaseModel):
    nome: str | None = None
    tipos: list[str] | None = None


class PokemonResponse(PokemonBase):
    model_config = ConfigDict(from_attributes=True)

    numero: int
