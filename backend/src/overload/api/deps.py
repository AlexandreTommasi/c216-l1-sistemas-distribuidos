from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from overload.database.session import get_db
from overload.repositories.exercicio import ExercicioRepository
from overload.repositories.serie import SerieRepository
from overload.repositories.sessao import SessaoRepository
from overload.repositories.treino import TreinoRepository
from overload.services.exercicio import ExercicioService
from overload.services.progresso import ProgressoService
from overload.services.serie import SerieService
from overload.services.sessao import SessaoService
from overload.services.treino import TreinoService


def get_exercicio_service(db: Session = Depends(get_db)) -> ExercicioService:
    return ExercicioService(ExercicioRepository(db))


def get_progresso_service(db: Session = Depends(get_db)) -> ProgressoService:
    return ProgressoService(
        SessaoRepository(db), SerieRepository(db), ExercicioRepository(db)
    )


def get_serie_service(db: Session = Depends(get_db)) -> SerieService:
    return SerieService(
        SerieRepository(db), SessaoRepository(db), ExercicioRepository(db)
    )


def get_sessao_service(db: Session = Depends(get_db)) -> SessaoService:
    return SessaoService(SessaoRepository(db), TreinoRepository(db))


def get_treino_service(db: Session = Depends(get_db)) -> TreinoService:
    return TreinoService(TreinoRepository(db))


ExercicioServiceDep = Annotated[ExercicioService, Depends(get_exercicio_service)]
ProgressoServiceDep = Annotated[ProgressoService, Depends(get_progresso_service)]
SerieServiceDep = Annotated[SerieService, Depends(get_serie_service)]
SessaoServiceDep = Annotated[SessaoService, Depends(get_sessao_service)]
TreinoServiceDep = Annotated[TreinoService, Depends(get_treino_service)]
