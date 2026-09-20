from pydantic import BaseModel


class Pokemon(BaseModel):
    numero: int
    nome: str
    tipos: list[str]
