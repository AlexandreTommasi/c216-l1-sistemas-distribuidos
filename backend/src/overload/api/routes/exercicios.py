from fastapi import APIRouter, status

from overload.api.deps import ExercicioServiceDep
from overload.models.exercicio import GrupoMuscular
from overload.schemas.exercicio import ExercicioCreate, ExercicioRead, ExercicioUpdate

router = APIRouter(prefix="/exercicios", tags=["Exercicios"])


@router.get("", response_model=list[ExercicioRead])
def listar_exercicios(
    svc: ExercicioServiceDep,
    grupo: GrupoMuscular | None = None,
) -> list[ExercicioRead]:
    return svc.listar(grupo)


@router.get("/{id}", response_model=ExercicioRead)
def buscar_exercicio(id: int, svc: ExercicioServiceDep) -> ExercicioRead:
    return svc.buscar(id)


@router.post("", response_model=ExercicioRead, status_code=status.HTTP_201_CREATED)
def criar_exercicio(dados: ExercicioCreate, svc: ExercicioServiceDep) -> ExercicioRead:
    return svc.criar(dados)


@router.put("/{id}", response_model=ExercicioRead)
def atualizar_exercicio(
    id: int, dados: ExercicioUpdate, svc: ExercicioServiceDep
) -> ExercicioRead:
    return svc.atualizar(id, dados)


@router.delete("/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def remover_exercicio(id: int, svc: ExercicioServiceDep) -> None:
    svc.remover(id)
