from datetime import datetime

from models import Unit
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SupplierCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    inn: str = Field(pattern=r"^\d{10}(\d{2})?$")
    contact_person: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=5, max_length=32)
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
    sku: str = Field(min_length=1, max_length=64)
    unit: Unit = Unit.PIECE
    min_level: int = Field(ge=0, default=0)
    default_supplier_id: int | None = Field(default=None, gt=0)


class ProductRead(BaseModel):
    id: int
    name: str
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
