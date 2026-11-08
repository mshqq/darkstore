from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SaleItemRead(BaseModel):
    id: int
    sale_id: int
    product_id: int
    qty: int
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class SaleRead(BaseModel):
    id: int
    created_at: datetime
    items: list[SaleItemRead]

    model_config = ConfigDict(from_attributes=True)


class SaleItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    qty: int = Field(gt=0)


class SaleCreate(BaseModel):
    items: list[SaleItemCreate] = Field(min_length=1)
