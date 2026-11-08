from fastapi import HTTPException, status
from models.product import Product
from models.stock import Stock
from sqlalchemy import select
from sqlalchemy.orm import Session, contains_eager

from inventory.schemas import StockRead


class StockService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def lock_and_validate_stock(
        self, quantities: dict[int, int]
    ) -> tuple[dict[int, Product], dict[int, Stock]]:
        product_ids = [pid for pid in quantities]

        stocks = self.db.scalars(
            select(Stock)
            .where(Stock.product_id.in_(product_ids))
            .order_by(Stock.product_id)
            .with_for_update()
        ).all()

        stocks_by_id: dict[int, Stock] = {stock.product_id: stock for stock in stocks}

        products = self.db.scalars(select(Product).where(Product.id.in_(product_ids)))

        products_by_id: dict[int, Product] = {
            product.id: product for product in products
        }

        for pid, qty in quantities.items():
            product = products_by_id.get(pid)

            if product is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Товар {pid} не найден",
                )

            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Товар {product.name} неактивен",
                )

            if product.selling_price is None or product.selling_price <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"У товара {product.name} не задана положительная цена",
                )

            stock = stocks_by_id.get(pid)
            if stock is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Нет остатков товара {product.name}",
                )

            available = stock.quantity - stock.reserved

            if available < qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f'Недостаточно товара "{product.name}": доступно {available}',
                )

        return products_by_id, stocks_by_id

    def list_stock(
        self, only_low: bool = False, include_inactive: bool = False
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

        stocks = self.db.scalars(statement).all()

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
