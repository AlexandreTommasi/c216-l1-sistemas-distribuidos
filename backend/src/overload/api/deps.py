from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from overload.database.session import get_db
from overload.services.exercicio import ExercicioService
from overload.services.sessao import SessaoService
from overload.services.treino import TreinoService


def get_exercicio_service(db: Session = Depends(get_db)) -> ExercicioService:
    return ExercicioService(db)


def get_sessao_service(db: Session = Depends(get_db)) -> SessaoService:
    return SessaoService(db)


def get_treino_service(db: Session = Depends(get_db)) -> TreinoService:
    return TreinoService(db)


ExercicioServiceDep = Annotated[ExercicioService, Depends(get_exercicio_service)]
SessaoServiceDep = Annotated[SessaoService, Depends(get_sessao_service)]
TreinoServiceDep = Annotated[TreinoService, Depends(get_treino_service)]
