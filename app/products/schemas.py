from datetime import datetime
from decimal import Decimal

from models.product import Unit
from pydantic import BaseModel, ConfigDict, Field


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
