"""initial

Revision ID: 659f8154f04c
Revises:
Create Date: 2026-11-20 18:23:40.787359

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "659f8154f04c"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "exercicio",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=80), nullable=False),
        sa.Column(
            "grupo_muscular",
            sa.Enum(
                "peito",
                "costas",
                "pernas",
                "ombros",
                "biceps",
                "triceps",
                "abdomen",
                "panturrilha",
                name="grupomuscular",
            ),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_exercicio")),
        sa.UniqueConstraint("nome", name=op.f("uq_exercicio_nome")),
    )
    op.create_table(
        "treino",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=60), nullable=False),
        sa.Column("dia_semana", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_treino")),
    )
    op.create_table(
        "sessao",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("treino_id", sa.Integer(), nullable=False),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("observacao", sa.String(length=280), nullable=True),
        sa.ForeignKeyConstraint(
            ["treino_id"],
            ["treino.id"],
            name=op.f("fk_sessao_treino_id_treino"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sessao")),
        sa.UniqueConstraint("treino_id", "data", name=op.f("uq_sessao_treino_id")),
    )
    op.create_table(
        "serie",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sessao_id", sa.Integer(), nullable=False),
        sa.Column("exercicio_id", sa.Integer(), nullable=False),
        sa.Column("carga_kg", sa.Numeric(precision=8, scale=3), nullable=False),
        sa.Column("repeticoes", sa.Integer(), nullable=False),
        sa.Column(
            "tipo",
            sa.Enum("aquecimento", "preparatoria", "valida", name="tiposerie"),
            nullable=False,
        ),
        sa.Column("ordem", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["exercicio_id"],
            ["exercicio.id"],
            name=op.f("fk_serie_exercicio_id_exercicio"),
        ),
        sa.ForeignKeyConstraint(
            ["sessao_id"],
            ["sessao.id"],
            name=op.f("fk_serie_sessao_id_sessao"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_serie")),
    )
    op.create_index(
        "ix_serie_exercicio_sessao",
        "serie",
        ["exercicio_id", "sessao_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_serie_exercicio_sessao", table_name="serie")
    op.drop_table("serie")
    op.drop_table("sessao")
    op.drop_table("treino")
    op.drop_table("exercicio")
    # enum types are not dropped automatically — explicit cleanup required
    sa.Enum(name="tiposerie").drop(op.get_bind())
    sa.Enum(name="grupomuscular").drop(op.get_bind())
