from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from overload.models.exercicio import GrupoMuscular


class ExercicioSugestao(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exercicio_id: int
    nome: str
    grupo_muscular: GrupoMuscular
    carga_kg: Decimal
    repeticoes: int
    series_validas: int


class TreinoBase(BaseModel):
    nome: str = Field(min_length=1, max_length=60)
    dia_semana: int | None = Field(default=None, ge=1, le=7)

    @field_validator("nome", mode="before")
    @classmethod
    def strip_nome(cls, v: str) -> str:
        return v.strip()


class TreinoCreate(TreinoBase):
    pass


class TreinoUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=60)
    dia_semana: int | None = Field(default=None, ge=1, le=7)

    @field_validator("nome", mode="before")
    @classmethod
    def strip_nome(cls, v: str | None) -> str | None:
        if v is not None:
            return v.strip()
        return v


class TreinoRead(TreinoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
