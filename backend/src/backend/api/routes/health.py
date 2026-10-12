from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    return {"service": "backend", "state": "up"}


@router.get("/info")
def info():
    return {
        "disciplina": "C216 - Sistemas Distribuidos",
        "instituicao": "INATEL",
        "periodo": "2026.2",
    }
