"""add product selling price

Revision ID: 36904c4ab146
Revises: 519554421b60
Create Date: 2026-11-02 09:06:24.973351

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "36904c4ab146"
down_revision: str | Sequence[str] | None = "519554421b60"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "selling_price",
            sa.Numeric(10, 2),
            nullable=True,
        ),
    )
    op.create_check_constraint(
        "ck_products_selling_price_positive",
        "products",
        "selling_price > 0",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_products_selling_price_positive",
        "products",
        type_="check",
    )
    op.drop_column("products", "selling_price")
