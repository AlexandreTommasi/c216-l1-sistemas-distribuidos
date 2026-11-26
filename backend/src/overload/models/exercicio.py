from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from overload.database.base import Base

if TYPE_CHECKING:
    from overload.models.serie import Serie


class GrupoMuscular(enum.StrEnum):
    peito = "peito"
    costas = "costas"
    pernas = "pernas"
    ombros = "ombros"
    biceps = "biceps"
    triceps = "triceps"
    abdomen = "abdomen"
    panturrilha = "panturrilha"


class Exercicio(Base):
    __tablename__ = "exercicio"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(80), unique=True)
    grupo_muscular: Mapped[GrupoMuscular] = mapped_column(
        SAEnum(GrupoMuscular, name="grupomuscular")
    )

    series: Mapped[list[Serie]] = relationship(back_populates="exercicio")
