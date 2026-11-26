from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


class HealthRead(BaseModel):
    service: str
    status: str


@router.get("/health", response_model=HealthRead)
def health() -> HealthRead:
    return HealthRead(service="overload", status="up")
