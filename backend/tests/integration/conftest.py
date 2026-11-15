import os

# Permite apontar a suite para um banco dedicado sem alterar o DATABASE_URL do ambiente.
if os.environ.get("TEST_DATABASE_URL"):
    os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]

import pytest
from sqlalchemy import delete
from sqlalchemy.orm import Session

from backend.models.pokemon import Pokemon

POKEDEX_INICIAL = [
    (1, "Bulbasaur", ["Grama", "Veneno"]),
    (4, "Charmander", ["Fogo"]),
    (7, "Squirtle", ["Agua"]),
    (25, "Pikachu", ["Eletrico"]),
    (39, "Jigglypuff", ["Normal", "Fada"]),
    (143, "Snorlax", ["Normal"]),
]


def _nova_sessao(connection) -> Session:
    # Os commits dos repositorios viram SAVEPOINTs dentro da transacao do teste.
    return Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        autoflush=False,
        expire_on_commit=False,
    )


@pytest.fixture
def connection():
    """Conexao com uma transacao externa que e sempre revertida ao fim do teste."""
    from backend.database.session import engine

    with engine.connect() as conn:
        transacao = conn.begin()
        with _nova_sessao(conn) as seed:
            seed.execute(delete(Pokemon))
            seed.add_all(
                Pokemon(numero=n, nome=nome, tipos=tipos)
                for n, nome, tipos in POKEDEX_INICIAL
            )
            seed.commit()
        yield conn
        transacao.rollback()


@pytest.fixture
def db_session(connection):
    with _nova_sessao(connection) as session:
        yield session


@pytest.fixture
def client(connection):
    # Importados aqui para que a suite unitaria rode sem DATABASE_URL.
    from fastapi.testclient import TestClient

    from backend.database.session import get_db
    from backend.main import app

    def override_get_db():
        # Uma sessao nova por requisicao, como em producao.
        with _nova_sessao(connection) as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
