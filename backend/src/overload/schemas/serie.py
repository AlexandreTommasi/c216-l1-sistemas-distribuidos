from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from overload.models.serie import TipoSerie


class SerieBase(BaseModel):
    exercicio_id: int
    carga_kg: Decimal = Field(gt=0, le=1000)
    repeticoes: int = Field(ge=1, le=100)
    tipo: TipoSerie = TipoSerie.valida
    ordem: int


class SerieCreate(SerieBase):
    pass


class SerieUpdate(BaseModel):
    exercicio_id: int | None = None
    carga_kg: Decimal | None = Field(default=None, gt=0, le=1000)
    repeticoes: int | None = Field(default=None, ge=1, le=100)
    tipo: TipoSerie | None = None
    ordem: int | None = None


class SerieRead(SerieBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sessao_id: int
