from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from backend.database.base import Base


class Pokemon(Base):
    __tablename__ = "pokemon"

    numero: Mapped[int] = mapped_column(primary_key=True, autoincrement=False)
    nome: Mapped[str] = mapped_column(String(100))
    tipos: Mapped[list[str]] = mapped_column(ARRAY(String(30)))
