from sqlalchemy import select
from sqlalchemy.orm import Session

from overload.models.treino import Treino
from overload.schemas.treino import TreinoCreate, TreinoUpdate


class TreinoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def listar(self) -> list[Treino]:
        return list(self.db.scalars(select(Treino)).all())

    def buscar_por_id(self, id: int) -> Treino | None:
        return self.db.get(Treino, id)

    def criar(self, dados: TreinoCreate) -> Treino:
        treino = Treino(**dados.model_dump())
        self.db.add(treino)
        self.db.commit()
        self.db.refresh(treino)
        return treino

    def atualizar(self, treino: Treino, dados: TreinoUpdate) -> Treino:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(treino, campo, valor)
        self.db.commit()
        self.db.refresh(treino)
        return treino

    def remover(self, treino: Treino) -> None:
        self.db.delete(treino)
        self.db.commit()
