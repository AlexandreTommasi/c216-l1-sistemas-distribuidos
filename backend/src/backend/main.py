from fastapi import FastAPI, HTTPException

from backend.pokedex import POKEDEX, Pokemon, buscar_por_numero, listar_por_tipo

app = FastAPI(
    title="C216 L1 - Backend",
    description="Backend do laboratorio de Sistemas Distribuidos",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"service": "backend", "state": "up"}


@app.get("/info")
def info():
    return {
        "disciplina": "C216 - Sistemas Distribuidos",
        "instituicao": "INATEL",
        "periodo": "2026.2",
        "versao": app.version,
    }


@app.get("/pokemon/{numero}")
def get_pokemon(numero: int) -> Pokemon:
    try:
        pokemon = buscar_por_numero(numero)
    except ValueError:
        raise HTTPException(status_code=422, detail="numero invalido")
    if pokemon is None:
        raise HTTPException(status_code=404, detail="pokemon nao encontrado")
    return pokemon


@app.get("/pokemon")
def list_pokemon(tipo: str | None = None) -> list[Pokemon]:
    if tipo is None:
        return list(POKEDEX.values())
    return listar_por_tipo(tipo)