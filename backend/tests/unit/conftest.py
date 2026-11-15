import pytest

from backend.models.pokemon import Pokemon
from backend.services import pokemon as pokemon_service


class RepositorioFake:
    """Repositorio em memoria: isola os services do banco nos testes unitarios."""

    def __init__(self):
        self.dados = {
            1: Pokemon(numero=1, nome="Bulbasaur", tipos=["Grama", "Veneno"]),
            4: Pokemon(numero=4, nome="Charmander", tipos=["Fogo"]),
            7: Pokemon(numero=7, nome="Squirtle", tipos=["Agua"]),
            25: Pokemon(numero=25, nome="Pikachu", tipos=["Eletrico"]),
            39: Pokemon(numero=39, nome="Jigglypuff", tipos=["Normal", "Fada"]),
            143: Pokemon(numero=143, nome="Snorlax", tipos=["Normal"]),
        }

    def get_by_numero(self, db, numero):
        return self.dados.get(numero)

    def get_by_nome(self, db, nome):
        return next((p for p in self.dados.values() if p.nome == nome), None)

    def list_all(self, db):
        return sorted(self.dados.values(), key=lambda p: p.numero)

    def list_by_tipo(self, db, tipo):
        return [p for p in self.list_all(db) if tipo in p.tipos]

    def create(self, db, numero, nome, tipos):
        self.dados[numero] = Pokemon(numero=numero, nome=nome, tipos=tipos)
        return self.dados[numero]

    def update(self, db, pokemon, nome, tipos):
        pokemon.nome = nome
        pokemon.tipos = tipos
        return pokemon

    def delete(self, db, pokemon):
        del self.dados[pokemon.numero]


@pytest.fixture(autouse=True)
def repositorio_fake(monkeypatch):
    fake = RepositorioFake()
    monkeypatch.setattr(pokemon_service, "repository", fake)
    return fake
