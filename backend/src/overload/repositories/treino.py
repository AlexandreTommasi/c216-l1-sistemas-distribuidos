from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from overload.models.serie import Serie, TipoSerie
from overload.models.sessao import Sessao
from overload.models.treino import Treino
from overload.schemas.treino import ExercicioSugestao, TreinoCreate, TreinoUpdate


class TreinoRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def buscar_sugestao(self, treino_id: int) -> list[ExercicioSugestao]:
        sessao = self.db.scalar(
            select(Sessao)
            .where(Sessao.treino_id == treino_id)
            .order_by(Sessao.data.desc())
            .limit(1)
        )
        if sessao is None:
            return []

        series = list(
            self.db.scalars(
                select(Serie)
                .where(Serie.sessao_id == sessao.id, Serie.tipo == TipoSerie.valida)
                .options(joinedload(Serie.exercicio))
                .order_by(Serie.ordem)
            )
            .unique()
            .all()
        )
        if not series:
            return []

        groups: dict[int, list[Serie]] = {}
        first_ordem: dict[int, int] = {}
        for s in series:
            if s.exercicio_id not in groups:
                groups[s.exercicio_id] = []
                first_ordem[s.exercicio_id] = s.ordem
            groups[s.exercicio_id].append(s)

        result = sorted(
            [
                ExercicioSugestao(
                    exercicio_id=ex_id,
                    nome=ex_series[-1].exercicio.nome,
                    grupo_muscular=ex_series[-1].exercicio.grupo_muscular,
                    carga_kg=ex_series[-1].carga_kg,
                    repeticoes=ex_series[-1].repeticoes,
                    series_validas=len(ex_series),
                )
                for ex_id, ex_series in groups.items()
            ],
            key=lambda s: first_ordem[s.exercicio_id],
        )
        return result

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
