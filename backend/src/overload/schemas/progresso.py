import datetime
import enum
from decimal import Decimal

from pydantic import BaseModel


class StatusProgresso(enum.StrEnum):
    evoluiu = "evoluiu"
    manteve = "manteve"
    regrediu = "regrediu"
    primeira_vez = "primeira_vez"


class ExecucaoAnterior(BaseModel):
    data: datetime.date
    carga_maxima_kg: Decimal
    repeticoes_totais: int


class Delta(BaseModel):
    carga_kg: Decimal
    carga_pct: float
    repeticoes: int


class ExercicioProgresso(BaseModel):
    exercicio_id: int
    nome: str
    carga_maxima_kg: Decimal
    repeticoes_totais: int
    sessao_anterior: ExecucaoAnterior | None = None
    delta: Delta | None = None
    status: StatusProgresso
    recorde_pessoal_kg: Decimal
    eh_recorde: bool


class SessaoProgresso(BaseModel):
    sessao_id: int
    data: datetime.date
    treino: str
    exercicios: list[ExercicioProgresso]


class PontoHistorico(BaseModel):
    data: datetime.date
    carga_maxima_kg: Decimal
    repeticoes_totais: int
