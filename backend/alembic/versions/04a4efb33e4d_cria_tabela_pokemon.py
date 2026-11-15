"""cria tabela pokemon

Revision ID: 04a4efb33e4d
Revises:
Create Date: 2026-10-17 23:29:42.288085

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "04a4efb33e4d"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "pokemon",
        sa.Column("numero", sa.Integer(), autoincrement=False, nullable=False),
        sa.Column("nome", sa.String(length=100), nullable=False),
        sa.Column("tipos", postgresql.ARRAY(sa.String(length=30)), nullable=False),
        sa.PrimaryKeyConstraint("numero"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("pokemon")
