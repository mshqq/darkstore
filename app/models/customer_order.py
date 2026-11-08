import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from database import Base
from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from models.customer_order_item import CustomerOrderItem


class CustomerOrderStatus(str, enum.Enum):
    new = "new"
    picking = "picking"
    ready = "ready"
    delivering = "delivering"
    delivered = "delivered"
    cancelled = "cancelled"


class CustomerOrder(Base):
    __tablename__ = "customer_orders"

    id: Mapped[int] = mapped_column(primary_key=True)

    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)

    address: Mapped[str] = mapped_column(String(500), nullable=False)
    comment: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    status: Mapped[CustomerOrderStatus] = mapped_column(
        Enum(
            CustomerOrderStatus,
            native_enum=False,
            length=10,
            values_callable=lambda e: [m.value for m in e],
        ),
        default=CustomerOrderStatus.new,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    items: Mapped[list["CustomerOrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )

    @property
    def total(self) -> Decimal:
        return sum((item.price * item.qty for item in self.items), start=Decimal("0.0"))
