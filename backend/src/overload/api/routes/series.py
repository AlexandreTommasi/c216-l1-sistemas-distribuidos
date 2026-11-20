from fastapi import APIRouter, status

from overload.api.deps import SerieServiceDep
from overload.schemas.serie import SerieCreate, SerieRead, SerieUpdate

router = APIRouter(tags=["Series"])


@router.post(
    "/sessoes/{sessao_id}/series",
    response_model=SerieRead,
    status_code=status.HTTP_201_CREATED,
)
def criar_serie(
    sessao_id: int, dados: SerieCreate, svc: SerieServiceDep
) -> SerieRead:
    return svc.criar(sessao_id, dados)


@router.patch("/series/{id}", response_model=SerieRead)
def atualizar_serie(
    id: int, dados: SerieUpdate, svc: SerieServiceDep
) -> SerieRead:
    return svc.atualizar(id, dados)


@router.delete(
    "/series/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT
)
def remover_serie(id: int, svc: SerieServiceDep) -> None:
    svc.remover(id)
