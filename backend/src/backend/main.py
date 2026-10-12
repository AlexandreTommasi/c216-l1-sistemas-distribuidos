from fastapi import FastAPI

from backend.api.routes import health as health_router
from backend.api.routes import pokemon as pokemon_router

app = FastAPI(
    title="C216 L1 - Backend",
    description="Backend do laboratorio de Sistemas Distribuidos",
    version="0.1.0",
)

app.include_router(health_router.router)
app.include_router(pokemon_router.router)
