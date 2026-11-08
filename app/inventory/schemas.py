from models.product import Unit
from pydantic import BaseModel, ConfigDict


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
