import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload

from overload.models.serie import Serie, TipoSerie
from overload.models.sessao import Sessao
from overload.schemas.sessao import SessaoCreate, SessaoUpdate


def _vol_sq():
    """Subconsulta escalar: soma de carga_kg * repeticoes das séries válidas."""
    return (
        select(func.coalesce(func.sum(Serie.carga_kg * Serie.repeticoes), 0))
        .where(Serie.sessao_id == Sessao.id, Serie.tipo == TipoSerie.valida)
        .correlate(Sessao)
        .scalar_subquery()
    )


class SessaoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def listar(self, limite: int = 20, offset: int = 0) -> list[tuple[Sessao, Decimal]]:
        vol = _vol_sq()
        stmt = (
            select(Sessao, vol.label("volume_total_kg"))
            .options(joinedload(Sessao.treino))
            .order_by(Sessao.data.desc())
            .limit(limite)
            .offset(offset)
        )
        return list(self.db.execute(stmt).unique().all())

    def buscar_por_id(self, id: int) -> tuple[Sessao, Decimal] | None:
        vol = _vol_sq()
        stmt = (
            select(Sessao, vol.label("volume_total_kg"))
            .where(Sessao.id == id)
            .options(
                joinedload(Sessao.treino),
                selectinload(Sessao.series),
            )
        )
        row = self.db.execute(stmt).unique().first()
        return tuple(row) if row is not None else None  # type: ignore[return-value]

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
