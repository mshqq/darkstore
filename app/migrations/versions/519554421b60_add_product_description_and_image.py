"""add product description and image

Revision ID: 519554421b60
Revises: 3f586254d861
Create Date: 2026-11-01 04:01:52.456922

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "519554421b60"
down_revision: str | Sequence[str] | None = "3f586254d861"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("description", sa.String(2000), nullable=True),
    )
    op.add_column(
        "products",
        sa.Column("image_url", sa.String(500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("products", "image_url")
    op.drop_column("products", "description")
