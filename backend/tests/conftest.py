import copy

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services import pokemon as pokemon_service

_POKEDEX_INICIAL = copy.deepcopy(pokemon_service.POKEDEX)


@pytest.fixture(autouse=True)
def pokedex_limpo():
    yield
    pokemon_service.POKEDEX.clear()
    pokemon_service.POKEDEX.update(copy.deepcopy(_POKEDEX_INICIAL))


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
