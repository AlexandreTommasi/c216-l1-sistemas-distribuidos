import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from overload.models.sessao import Sessao
from overload.schemas.sessao import SessaoCreate, SessaoUpdate


class SessaoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def listar(self, limite: int = 20, offset: int = 0) -> list[Sessao]:
        stmt = (
            select(Sessao)
            .options(joinedload(Sessao.treino))
            .order_by(Sessao.data.desc())
            .limit(limite)
            .offset(offset)
        )
        return list(self.db.scalars(stmt).unique().all())

    def buscar_por_id(self, id: int) -> Sessao | None:
        stmt = (
            select(Sessao)
            .where(Sessao.id == id)
            .options(
                joinedload(Sessao.treino),
                selectinload(Sessao.series),
            )
        )
        return self.db.scalars(stmt).unique().first()

    def buscar_por_treino_e_data(
        self, treino_id: int, data: datetime.date
    ) -> Sessao | None:
        stmt = select(Sessao).where(
            Sessao.treino_id == treino_id,
            Sessao.data == data,
        )
        return self.db.scalars(stmt).first()

    def criar(self, dados: SessaoCreate) -> Sessao:
        sessao = Sessao(**dados.model_dump())
        self.db.add(sessao)
        self.db.commit()
        self.db.refresh(sessao)
        return sessao

    def atualizar(self, sessao: Sessao, dados: SessaoUpdate) -> Sessao:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(sessao, campo, valor)
        self.db.commit()
        self.db.refresh(sessao)
        return sessao

    def remover(self, sessao: Sessao) -> None:
        self.db.delete(sessao)
        self.db.commit()
