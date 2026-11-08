from datetime import datetime
from decimal import Decimal

from models.customer_order import CustomerOrderStatus
from pydantic import BaseModel, ConfigDict, Field


class CustomerOrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    qty: int = Field(gt=0)


class CustomerOrderItemRead(BaseModel):
    id: int
    product_id: int
    product_name: str
    qty: int
    price: Decimal

    model_config = ConfigDict(from_attributes=True)


class CustomerOrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=1, max_length=32)
    address: str = Field(min_length=1, max_length=500)
    comment: str | None = Field(default=None, max_length=1000)

    items: list[CustomerOrderItemCreate] = Field(min_length=1)

    model_config = ConfigDict(str_strip_whitespace=True)


class CustomerOrderRead(BaseModel):
    id: int
    customer_name: str
    phone: str
    address: str
    comment: str | None
    status: CustomerOrderStatus
    created_at: datetime

    total: Decimal

    items: list[CustomerOrderItemRead]

    model_config = ConfigDict(from_attributes=True)
