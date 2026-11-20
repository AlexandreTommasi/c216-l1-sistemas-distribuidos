from sqlalchemy import func, select
from sqlalchemy.orm import Session

from overload.models.exercicio import Exercicio, GrupoMuscular
from overload.models.serie import Serie
from overload.schemas.exercicio import ExercicioCreate, ExercicioUpdate


class ExercicioRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def listar(self, grupo: GrupoMuscular | None = None) -> list[Exercicio]:
        stmt = select(Exercicio)
        if grupo is not None:
            stmt = stmt.where(Exercicio.grupo_muscular == grupo)
        return list(self.db.scalars(stmt).all())

    def buscar_por_id(self, id: int) -> Exercicio | None:
        return self.db.get(Exercicio, id)

    def buscar_por_nome_normalizado(self, nome: str) -> Exercicio | None:
        stmt = select(Exercicio).where(func.lower(Exercicio.nome) == nome)
        return self.db.scalars(stmt).first()

    def criar(self, dados: ExercicioCreate) -> Exercicio:
        exercicio = Exercicio(**dados.model_dump())
        self.db.add(exercicio)
        self.db.commit()
        self.db.refresh(exercicio)
        return exercicio

    def atualizar(self, exercicio: Exercicio, dados: ExercicioUpdate) -> Exercicio:
        for campo, valor in dados.model_dump(exclude_unset=True).items():
            setattr(exercicio, campo, valor)
        self.db.commit()
        self.db.refresh(exercicio)
        return exercicio

    def remover(self, exercicio: Exercicio) -> None:
        self.db.delete(exercicio)
        self.db.commit()

    def contar_series(self, exercicio_id: int) -> int:
        stmt = select(func.count()).select_from(Serie).where(
            Serie.exercicio_id == exercicio_id
        )
        return self.db.scalar(stmt) or 0
