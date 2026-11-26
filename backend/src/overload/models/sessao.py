from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from overload.database.base import Base

if TYPE_CHECKING:
    from overload.models.serie import Serie
    from overload.models.treino import Treino


class Sessao(Base):
    __tablename__ = "sessao"
    __table_args__ = (UniqueConstraint("treino_id", "data"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    treino_id: Mapped[int] = mapped_column(ForeignKey("treino.id"))
    data: Mapped[datetime.date] = mapped_column(Date)
    observacao: Mapped[str | None] = mapped_column(String(280), default=None)

    treino: Mapped[Treino] = relationship(back_populates="sessoes")
    series: Mapped[list[Serie]] = relationship(
        back_populates="sessao",
        cascade="all, delete-orphan",
    )
