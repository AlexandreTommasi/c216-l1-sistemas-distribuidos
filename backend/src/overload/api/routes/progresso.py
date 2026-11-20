from fastapi import APIRouter

from overload.api.deps import ProgressoServiceDep
from overload.schemas.progresso import PontoHistorico, SessaoProgresso

router = APIRouter(tags=["Progresso"])


@router.get("/sessoes/{id}/comparacao", response_model=SessaoProgresso)
def comparar_sessao(id: int, svc: ProgressoServiceDep) -> SessaoProgresso:
    return svc.comparar_sessao(id)


@router.get("/exercicios/{id}/historico", response_model=list[PontoHistorico])
def historico_exercicio(
    id: int, svc: ProgressoServiceDep
) -> list[PontoHistorico]:
    return svc.historico_exercicio(id)
