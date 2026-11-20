import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from overload.models.serie import Serie, TipoSerie
from overload.models.sessao import Sessao
from overload.schemas.serie import SerieCreate, SerieUpdate


class SerieRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def listar_por_sessao(self, sessao_id: int) -> list[Serie]:
        stmt = (
            select(Serie)
            .where(Serie.sessao_id == sessao_id)
            .order_by(Serie.ordem)
        )
        return list(self.db.scalars(stmt).all())

    def buscar_por_id(self, id: int) -> Serie | None:
        return self.db.get(Serie, id)

    def criar(self, dados: SerieCreate, sessao_id: int, ordem: int) -> Serie:
        dump = dados.model_dump(exclude={"ordem"})
        serie = Serie(**dump, sessao_id=sessao_id, ordem=ordem)
        self.db.add(serie)
        self.db.commit()
        self.db.refresh(serie)
        return serie

    def atualizar(self, serie: Serie, dados: SerieUpdate) -> Serie:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(serie, campo, valor)
        self.db.commit()
        self.db.refresh(serie)
        return serie

    def remover(self, serie: Serie) -> None:
        self.db.delete(serie)
        self.db.commit()

    def buscar_sessao_anterior(
        self, exercicio_id: int, data_atual: datetime.date
    ) -> Sessao | None:
        subq = (
            select(Serie.sessao_id)
            .join(Sessao, Sessao.id == Serie.sessao_id)
            .where(Serie.exercicio_id == exercicio_id)
            .where(Sessao.data < data_atual)
            .order_by(Sessao.data.desc())
            .limit(1)
            .scalar_subquery()
        )
        stmt = (
            select(Sessao)
            .where(Sessao.id == subq)
            .options(
                selectinload(Sessao.series.and_(Serie.tipo == TipoSerie.valida))
            )
        )
        return self.db.scalars(stmt).first()

    def historico_por_exercicio(self, exercicio_id: int) -> list:
        stmt = (
            select(
                Sessao.data,
                func.max(Serie.carga_kg).label("carga_maxima_kg"),
                func.sum(Serie.carga_kg * Serie.repeticoes).label("volume_kg"),
            )
            .join(Sessao, Sessao.id == Serie.sessao_id)
            .where(Serie.exercicio_id == exercicio_id)
            .where(Serie.tipo == TipoSerie.valida)
            .group_by(Sessao.data)
            .order_by(Sessao.data.asc())
        )
        return list(self.db.execute(stmt).all())

    def buscar_recorde(self, exercicio_id: int) -> Serie | None:
        # exclui preparatorias tambem: recorde pessoal conta apenas sets validos
        stmt = (
            select(Serie)
            .join(Sessao, Sessao.id == Serie.sessao_id)
            .where(Serie.exercicio_id == exercicio_id)
            .where(Serie.tipo == TipoSerie.valida)
            .options(joinedload(Serie.sessao))
            .order_by(Serie.carga_kg.desc())
            .limit(1)
        )
        return self.db.scalars(stmt).first()
