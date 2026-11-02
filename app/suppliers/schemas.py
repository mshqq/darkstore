from datetime import datetime
from decimal import Decimal

from models import Status, Unit
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SupplierCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    inn: str = Field(pattern=r"^\d{10}(\d{2})?$")
    contact_person: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=5, max_length=32)
    email: EmailStr | None = None


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    inn: str | None = Field(pattern=r"^\d{10}(\d{2})?$")
    contact_person: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, min_length=5, max_length=32)
    email: EmailStr | None = None


class SupplierRead(BaseModel):
    id: int
    name: str
    inn: str
    contact_person: str
    address: str
    phone: str
    email: EmailStr | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    selling_price: Decimal | None = Field(
        default=None, gt=Decimal(0), max_digits=10, decimal_places=2
    )
    sku: str = Field(min_length=1, max_length=64)
    unit: Unit = Unit.PIECE
    min_level: int = Field(ge=0, default=0)
    default_supplier_id: int | None = Field(default=None, gt=0)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    selling_price: Decimal | None = Field(
        default=None, gt=Decimal(0), max_digits=10, decimal_places=2
    )
    sku: str | None = Field(default=None, min_length=1, max_length=64)
    min_level: int | None = Field(default=None, ge=0)
    default_supplier_id: int | None = Field(default=None, gt=0)


class ProductRead(BaseModel):
    id: int
    name: str
    description: str | None
    image_url: str | None
    selling_price: Decimal | None
    sku: str
    unit: Unit
    min_level: int
    is_active: bool
    default_supplier_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockRead(BaseModel):
    product_id: int
    name: str
    sku: str
    unit: Unit
    min_level: int
    quantity: int
    reserved: int
    available: int
    is_low: bool

    model_config = ConfigDict(from_attributes=True)


class OrderItemIn(BaseModel):
    product_id: int = Field(gt=0)
    qty: int = Field(gt=0)
    price: Decimal = Field(gt=Decimal(0), max_digits=10, decimal_places=2)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    qty: int
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderCreate(BaseModel):
    supplier_id: int = Field(gt=0)
    items: list[OrderItemIn] = Field(min_length=1)
    comment: str | None = Field(default=None, max_length=500)


class PurchaseOrderRead(BaseModel):
    id: int
    supplier_id: int
    status: Status
    comment: str | None
    created_at: datetime
    sent_at: datetime | None
    received_at: datetime | None
    items: list[OrderItemRead]

    model_config = ConfigDict(from_attributes=True)
