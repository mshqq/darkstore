from datetime import datetime
from decimal import Decimal

from models.purchase_order import Status
from pydantic import BaseModel, ConfigDict, Field


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
