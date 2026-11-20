from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from overload.api.routes import exercicios, health, series, sessoes, treinos
from overload.core.config import get_settings
from overload.services.errors import Conflito, NaoEncontrado

app = FastAPI(
    title="Overload",
    description="Registro de treino de musculação com evolução por exercício",
    version="0.1.0",
)


@app.exception_handler(NaoEncontrado)
async def nao_encontrado_handler(
    request: Request, exc: NaoEncontrado
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(Conflito)
async def conflito_handler(request: Request, exc: Conflito) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router)
app.include_router(exercicios.router)
app.include_router(treinos.router)
app.include_router(sessoes.router)
app.include_router(series.router)
