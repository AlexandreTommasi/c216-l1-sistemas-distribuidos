from sqlalchemy.orm import Session

from overload.models.treino import Treino
from overload.repositories.treino import TreinoRepository
from overload.schemas.treino import TreinoCreate, TreinoUpdate
from overload.services.errors import NaoEncontrado


class TreinoService:
    def __init__(self, db: Session) -> None:
        self.repo = TreinoRepository(db)

    def listar(self) -> list[Treino]:
        return self.repo.listar()

    def buscar(self, id: int) -> Treino:
        treino = self.repo.buscar_por_id(id)
        if treino is None:
            raise NaoEncontrado()
        return treino

    def criar(self, dados: TreinoCreate) -> Treino:
        return self.repo.criar(dados)

    def atualizar(self, id: int, dados: TreinoUpdate) -> Treino:
        treino = self.buscar(id)
        return self.repo.atualizar(treino, dados)

    def remover(self, id: int) -> None:
        treino = self.buscar(id)
        self.repo.remover(treino)
