"""acentua e capitaliza os nomes de exercicio da seed

A seed gravou os nomes em minusculas e sem acento ("bulgaro", "triceps
frances"). Esta revisao corrige os dados ja existentes em vez de editar a
migration de seed: alterar uma revisao que ja foi aplicada deixaria bancos
existentes divergindo do historico.

Revision ID: b3d5f7a9c1e2
Revises: f1e2d3c4b5a6
Create Date: 2026-11-25 00:00:00.000000

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "b3d5f7a9c1e2"
down_revision = "f1e2d3c4b5a6"
branch_labels = None
depends_on = None

# nome gravado pela seed -> nome correto
NOMES = {
    "supino inclinado com halteres": "Supino inclinado com halteres",
    "desenvolvimento militar": "Desenvolvimento militar",
    "crucifixo na maquina": "Crucifixo na máquina",
    "triceps corda": "Tríceps corda",
    "triceps frances": "Tríceps francês",
    "pulldown": "Pulldown",
    "remada curvada": "Remada curvada",
    "remada unilateral": "Remada unilateral",
    "rosca bayesiana": "Rosca bayesiana",
    "rosca martelo": "Rosca martelo",
    "agachamento livre": "Agachamento livre",
    "bulgaro": "Búlgaro",
    "leg press": "Leg press",
    "cadeira flexora": "Cadeira flexora",
    "panturrilha em pe": "Panturrilha em pé",
}

_RENOMEIA = sa.text("UPDATE exercicio SET nome = :novo WHERE nome = :antigo")


def upgrade() -> None:
    conn = op.get_bind()
    for antigo, novo in NOMES.items():
        conn.execute(_RENOMEIA, {"antigo": antigo, "novo": novo})


def downgrade() -> None:
    conn = op.get_bind()
    for antigo, novo in NOMES.items():
        conn.execute(_RENOMEIA, {"antigo": novo, "novo": antigo})
