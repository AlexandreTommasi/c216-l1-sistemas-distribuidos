from pydantic import BaseModel, ConfigDict, Field, field_validator

from overload.models.exercicio import GrupoMuscular


class ExercicioBase(BaseModel):
    nome: str = Field(min_length=1, max_length=80)
    grupo_muscular: GrupoMuscular

    @field_validator("nome", mode="before")
    @classmethod
    def strip_nome(cls, v: str) -> str:
        return v.strip()


class ExercicioCreate(ExercicioBase):
    pass


class ExercicioUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=1, max_length=80)
    grupo_muscular: GrupoMuscular | None = None

    @field_validator("nome", mode="before")
    @classmethod
    def strip_nome(cls, v: str | None) -> str | None:
        if v is not None:
            return v.strip()
        return v


class ExercicioRead(ExercicioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
