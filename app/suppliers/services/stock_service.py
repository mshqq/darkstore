from models import Product, Stock
from sqlalchemy import select
from sqlalchemy.orm import Session, contains_eager
from suppliers.schemas import StockRead


def list_stock(
    db: Session, only_low: bool = False, include_inactive: bool = False
) -> list[StockRead]:
    statement = (
        select(Stock)
        .join(Stock.product)
        .options(contains_eager(Stock.product))
        .order_by(Product.name)
    )

    if only_low:
        statement = statement.where(
            Stock.quantity - Stock.reserved <= Product.min_level
        )

    if not include_inactive:
        statement = statement.where(Product.is_active.is_(True))

    stocks = db.scalars(statement).all()

    stock_items = [
        StockRead(
            product_id=s.product_id,
            name=s.product.name,
            sku=s.product.sku,
            unit=s.product.unit,
            min_level=s.product.min_level,
            quantity=s.quantity,
            reserved=s.reserved,
            available=s.quantity - s.reserved,
            is_low=s.quantity - s.reserved <= s.product.min_level,
        )
        for s in stocks
    ]

    return stock_items
