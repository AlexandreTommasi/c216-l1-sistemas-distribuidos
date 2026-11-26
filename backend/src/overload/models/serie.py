from __future__ import annotations

import enum
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import ForeignKey, Index, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from overload.database.base import Base

if TYPE_CHECKING:
    from overload.models.exercicio import Exercicio
    from overload.models.sessao import Sessao


class TipoSerie(enum.StrEnum):
    aquecimento = "aquecimento"
    preparatoria = "preparatoria"
    valida = "valida"


class Serie(Base):
    __tablename__ = "serie"
    __table_args__ = (Index("ix_serie_exercicio_sessao", "exercicio_id", "sessao_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    sessao_id: Mapped[int] = mapped_column(ForeignKey("sessao.id", ondelete="CASCADE"))
    exercicio_id: Mapped[int] = mapped_column(ForeignKey("exercicio.id"))
    carga_kg: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    repeticoes: Mapped[int]
    tipo: Mapped[TipoSerie] = mapped_column(SAEnum(TipoSerie, name="tiposerie"))
    ordem: Mapped[int]

    sessao: Mapped[Sessao] = relationship(back_populates="series")
    exercicio: Mapped[Exercicio] = relationship(back_populates="series")
