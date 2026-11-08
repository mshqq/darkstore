"""baseline

Revision ID: 3f586254d861
Revises:
Create Date: 2026-11-01 03:58:05.760173

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3f586254d861"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "suppliers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("inn", sa.String(12), nullable=False),
        sa.Column("contact_person", sa.String(255), nullable=False),
        sa.Column("address", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column(
            "is_active",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("inn"),
    )

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("sku", sa.String(64), nullable=False),
        sa.Column(
            "unit",
            sa.Enum("шт", "кг", "л", "уп", name="unit", native_enum=False, length=8),
            nullable=False,
        ),
        sa.Column(
            "min_level", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("default_supplier_id", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("sku"),
        sa.ForeignKeyConstraint(["default_supplier_id"], ["suppliers.id"]),
        sa.CheckConstraint("min_level >= 0", name="ck_products_min_level_non_negative"),
    )

    op.create_table(
        "stock",
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column(
            "quantity", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "reserved", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("product_id"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.CheckConstraint(
            "quantity >= 0",
            name="ck_stock_quantity_non_negative",
        ),
        sa.CheckConstraint(
            "reserved >= 0",
            name="ck_stock_reserved_non_negative",
        ),
        sa.CheckConstraint(
            "reserved <= quantity",
            name="ck_stock_reserved_le_quantity",
        ),
    )

    op.create_table(
        "purchase_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("supplier_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "draft", "sent", "received", name="status", native_enum=False, length=10
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("comment", sa.String(500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"]),
    )

    op.create_table(
        "purchase_order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["order_id"], ["purchase_orders.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"]),
        sa.CheckConstraint(
            "qty > 0",
            name="ck_purchase_order_item_qty_positive",
        ),
        sa.CheckConstraint(
            "price >= 0",
            name="ck_purchase_order_items_price_non_negative",
        ),
        sa.UniqueConstraint("order_id", "product_id", name="uq_order_product"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("purchase_order_items")
    op.drop_table("purchase_orders")
    op.drop_table("stock")
    op.drop_table("products")
    op.drop_table("suppliers")
