import datetime

from pydantic import AliasPath, BaseModel, ConfigDict, Field, field_validator

from overload.schemas.serie import SerieRead


def _valida_data_nao_futura(v: datetime.date | None) -> datetime.date | None:
    if v is not None and v > datetime.date.today():
        raise ValueError("data nao pode ser futura")
    return v


class SessaoBase(BaseModel):
    treino_id: int
    data: datetime.date
    observacao: str | None = Field(default=None, max_length=280)

    @field_validator("data", mode="before")
    @classmethod
    def data_nao_futura(cls, v: datetime.date | None) -> datetime.date | None:
        return _valida_data_nao_futura(v)


class SessaoCreate(SessaoBase):
    pass


class SessaoUpdate(BaseModel):
    treino_id: int | None = None
    data: datetime.date | None = None
    observacao: str | None = Field(default=None, max_length=280)

    @field_validator("data", mode="before")
    @classmethod
    def data_nao_futura(cls, v: datetime.date | None) -> datetime.date | None:
        return _valida_data_nao_futura(v)


class SessaoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    treino_id: int
    data: datetime.date
    observacao: str | None = None
    treino_nome: str = Field(validation_alias=AliasPath("treino", "nome"))


class SessaoDetalhe(SessaoRead):
    series: list[SerieRead] = []
