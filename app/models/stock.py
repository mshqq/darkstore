from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.product import Product

from database import Base
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Stock(Base):
    __tablename__ = "stock"

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), primary_key=True
    )
    quantity: Mapped[int] = mapped_column(
        default=0, nullable=False, server_default=text("0")
    )
    reserved: Mapped[int] = mapped_column(
        default=0, nullable=False, server_default=text("0")
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        onupdate=func.now(),
        server_default=func.now(),
        nullable=False,
    )

    product: Mapped["Product"] = relationship(back_populates="stock")

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_stock_quantity_non_negative"),
        CheckConstraint("reserved >= 0", name="ck_stock_reserved_non_negative"),
        CheckConstraint("reserved <= quantity", name="ck_stock_reserved_le_quantity"),
    )
