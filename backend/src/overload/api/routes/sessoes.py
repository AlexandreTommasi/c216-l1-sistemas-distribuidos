from fastapi import APIRouter, status

from overload.api.deps import SessaoServiceDep
from overload.schemas.sessao import (
    SessaoCreate,
    SessaoDetalhe,
    SessaoRead,
    SessaoUpdate,
)

router = APIRouter(prefix="/sessoes", tags=["Sessoes"])


@router.get("", response_model=list[SessaoRead])
def listar_sessoes(
    svc: SessaoServiceDep,
    limite: int = 20,
    offset: int = 0,
) -> list[SessaoRead]:
    return svc.listar(limite, offset)


@router.get("/{id}", response_model=SessaoDetalhe)
def buscar_sessao(id: int, svc: SessaoServiceDep) -> SessaoDetalhe:
    return svc.buscar(id)


@router.post("", response_model=SessaoRead, status_code=status.HTTP_201_CREATED)
def criar_sessao(dados: SessaoCreate, svc: SessaoServiceDep) -> SessaoRead:
    return svc.criar(dados)


@router.patch("/{id}", response_model=SessaoRead)
def atualizar_sessao(id: int, dados: SessaoUpdate, svc: SessaoServiceDep) -> SessaoRead:
    return svc.atualizar(id, dados)


@router.delete("/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def remover_sessao(id: int, svc: SessaoServiceDep) -> None:
    svc.remover(id)
