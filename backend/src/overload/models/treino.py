from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from overload.database.base import Base

if TYPE_CHECKING:
    from overload.models.sessao import Sessao


class Treino(Base):
    __tablename__ = "treino"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(60))
    dia_semana: Mapped[int | None] = mapped_column(default=None)

    sessoes: Mapped[list[Sessao]] = relationship(back_populates="treino")
