from decimal import Decimal
from typing import TYPE_CHECKING

from database import Base
from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from models.product import Product
    from models.purchase_order import PurchaseOrder


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[int] = mapped_column(primary_key=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)

    qty: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("qty > 0", name="ck_purchase_order_item_qty_positive"),
        CheckConstraint(
            "price >= 0", name="ck_purchase_order_items_price_non_negative"
        ),
        UniqueConstraint("order_id", "product_id", name="uq_order_product"),
    )

    order: Mapped["PurchaseOrder"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
