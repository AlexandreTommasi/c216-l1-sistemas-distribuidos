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
    volume_kg: Decimal


class Delta(BaseModel):
    carga_kg: Decimal
    carga_pct: float
    repeticoes: int
    volume_kg: Decimal


class ExercicioProgresso(BaseModel):
    exercicio_id: int
    nome: str
    carga_maxima_kg: Decimal
    repeticoes_totais: int
    volume_kg: Decimal
    sessao_anterior: ExecucaoAnterior | None = None
    delta: Delta | None = None
    status: StatusProgresso
    recorde_pessoal_kg: Decimal
    eh_recorde: bool


class SessaoProgresso(BaseModel):
    sessao_id: int
    data: datetime.date
    treino: str
    volume_total_kg: Decimal
    exercicios: list[ExercicioProgresso]
