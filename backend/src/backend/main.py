from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import health as health_router
from backend.api.routes import pokemon as pokemon_router
from backend.core.config import get_settings

app = FastAPI(
    title="C216 L1 - Backend",
    description="Backend do laboratorio de Sistemas Distribuidos",
    version="0.1.0",
)

_settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(health_router.router)
app.include_router(pokemon_router.router)
