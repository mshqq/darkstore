import enum
from datetime import datetime
from decimal import Decimal

from database import Base
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    inn: Mapped[str] = mapped_column(String(12), nullable=False, unique=True)
    contact_person: Mapped[str] = mapped_column(String(255), nullable=False)

    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))

    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, server_default=text("true")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    purchase_orders: Mapped[list["PurchaseOrder"]] = relationship(
        back_populates="supplier"
    )

    def __repr__(self) -> str:
        return f"<Supplier(id={self.id}, name={self.name!r})>"


class Unit(str, enum.Enum):
    PIECE = "шт"
    KILOGRAM = "кг"
    LITER = "л"
    PACK = "уп"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(255), nullable=False)

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
    )


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
