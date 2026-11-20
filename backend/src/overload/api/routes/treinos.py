from fastapi import APIRouter, status

from overload.api.deps import TreinoServiceDep
from overload.schemas.treino import TreinoCreate, TreinoRead, TreinoUpdate

router = APIRouter(prefix="/treinos", tags=["Treinos"])


@router.get("", response_model=list[TreinoRead])
def listar_treinos(svc: TreinoServiceDep) -> list[TreinoRead]:
    return svc.listar()


@router.get("/{id}", response_model=TreinoRead)
def buscar_treino(id: int, svc: TreinoServiceDep) -> TreinoRead:
    return svc.buscar(id)


@router.post("", response_model=TreinoRead, status_code=status.HTTP_201_CREATED)
def criar_treino(dados: TreinoCreate, svc: TreinoServiceDep) -> TreinoRead:
    return svc.criar(dados)


@router.put("/{id}", response_model=TreinoRead)
def atualizar_treino(
    id: int, dados: TreinoUpdate, svc: TreinoServiceDep
) -> TreinoRead:
    return svc.atualizar(id, dados)


@router.delete("/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def remover_treino(id: int, svc: TreinoServiceDep) -> None:
    svc.remover(id)
