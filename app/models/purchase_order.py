import enum
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.purchase_order_item import PurchaseOrderItem
    from models.supplier import Supplier


from database import Base
from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Status(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    received = "received"


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)

    status: Mapped[Status] = mapped_column(
        Enum(
            Status,
            native_enum=False,
            length=10,
            values_callable=lambda e: [m.value for m in e],  # type: ignore
        ),
        default=Status.draft,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )
    received_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )
    comment: Mapped[str | None] = mapped_column(String(500), nullable=True)

    supplier: Mapped["Supplier"] = relationship()
    items: Mapped[list["PurchaseOrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
