from fastapi import HTTPException, status
from inventory.service import StockService
from models.sale import Sale
from models.sale_item import SaleItem
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from sales.schemas import SaleCreate


class SaleService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_sales(self) -> list[Sale]:
        statement = (
            select(Sale).options(selectinload(Sale.items)).order_by(Sale.id.desc())
        )
        sales = self.db.scalars(statement).all()

        return list(sales)

    def get_sale(self, sale_id: int) -> Sale:
        sale = self.db.scalar(
            select(Sale).where(Sale.id == sale_id).options(selectinload(Sale.items))
        )

        if sale is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Продажа не найдена"
            )

        return sale

    def create_sale(self, data: SaleCreate) -> Sale:
        product_ids = [item.product_id for item in data.items]

        if len(product_ids) != len(set(product_ids)):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Товар не должен повторяться в продаже",
            )
        quantities = {item.product_id: item.qty for item in data.items}

        try:
            stock_service = StockService(self.db)
            products_by_id, stocks_by_id = stock_service.lock_and_validate_stock(
                quantities
            )

            sale = Sale()

            for item in data.items:
                product = products_by_id[item.product_id]
                stock = stocks_by_id[item.product_id]

                stock.quantity -= item.qty
                sale.items.append(
                    SaleItem(
                        product_id=product.id, qty=item.qty, price=product.selling_price
                    )
                )
            self.db.add(sale)
            self.db.flush()
            sale_id = sale.id
            self.db.commit()

        except Exception:
            self.db.rollback()
            raise

        return self.get_sale(sale_id)
