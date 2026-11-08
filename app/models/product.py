import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.stock import Stock

from database import Base
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Unit(str, enum.Enum):
    PIECE = "шт"
    KILOGRAM = "кг"
    LITER = "л"
    PACK = "уп"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    selling_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    sku: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    unit: Mapped[Unit] = mapped_column(
        Enum(
            Unit,
            native_enum=False,
            length=8,
            values_callable=lambda e: [m.value for m in e],  # type: ignore
        ),
        default=Unit.PIECE,
        nullable=False,
    )
    min_level: Mapped[int] = mapped_column(
        default=0, nullable=False, server_default=text("0")
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, server_default=text("true")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    default_supplier_id: Mapped[int | None] = mapped_column(
        ForeignKey("suppliers.id"), nullable=True
    )

    stock: Mapped["Stock | None"] = relationship(
        back_populates="product", uselist=False
    )

    __table_args__ = (
        CheckConstraint(
            "min_level >= 0",
            name="ck_products_min_level_non_negative",
        ),
        CheckConstraint("selling_price > 0", name="ck_products_selling_price_positive"),
    )
