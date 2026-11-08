from decimal import Decimal
from typing import TYPE_CHECKING

from database import Base
from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from models.customer_order import CustomerOrder
    from models.product import Product


class CustomerOrderItem(Base):
    __tablename__ = "customer_order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("customer_orders.id", ondelete="CASCADE"), nullable=False
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    qty: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("qty > 0", name="ck_customer_order_item_qty_positive"),
        CheckConstraint("price > 0", name="ck_customer_order_item_price_positive"),
        UniqueConstraint("order_id", "product_id", name="uq_customer_order_product"),
    )

    order: Mapped["CustomerOrder"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
