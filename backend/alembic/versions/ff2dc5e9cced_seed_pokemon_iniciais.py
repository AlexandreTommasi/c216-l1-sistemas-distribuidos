"""seed pokemon iniciais

Revision ID: ff2dc5e9cced
Revises: 04a4efb33e4d
Create Date: 2026-10-17 23:34:38.797812

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ff2dc5e9cced"
down_revision: str | Sequence[str] | None = "04a4efb33e4d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Definicao local da tabela: a migration nao depende dos modelos da aplicacao.
pokemon = sa.table(
    "pokemon",
    sa.column("numero", sa.Integer),
    sa.column("nome", sa.String),
    sa.column("tipos", postgresql.ARRAY(sa.String)),
)

POKEMON_INICIAIS = [
    {"numero": 1, "nome": "Bulbasaur", "tipos": ["Grama", "Veneno"]},
    {"numero": 4, "nome": "Charmander", "tipos": ["Fogo"]},
    {"numero": 7, "nome": "Squirtle", "tipos": ["Agua"]},
    {"numero": 25, "nome": "Pikachu", "tipos": ["Eletrico"]},
    {"numero": 39, "nome": "Jigglypuff", "tipos": ["Normal", "Fada"]},
    {"numero": 143, "nome": "Snorlax", "tipos": ["Normal"]},
]


def upgrade() -> None:
    """Insere os pokemons iniciais."""
    op.bulk_insert(pokemon, POKEMON_INICIAIS)


def downgrade() -> None:
    """Remove apenas os pokemons inseridos por esta migration."""
    numeros = [p["numero"] for p in POKEMON_INICIAIS]
    op.execute(pokemon.delete().where(pokemon.c.numero.in_(numeros)))
