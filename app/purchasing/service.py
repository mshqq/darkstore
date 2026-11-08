from datetime import UTC, datetime

from fastapi import HTTPException, status
from models.product import Product
from models.purchase_order import PurchaseOrder, Status
from models.purchase_order_item import PurchaseOrderItem
from models.stock import Stock
from models.supplier import Supplier
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.session import Session

from purchasing.schemas import PurchaseOrderCreate


class PurchasingService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_order(self, data: PurchaseOrderCreate) -> PurchaseOrder:
        supplier = self.db.get(Supplier, data.supplier_id)

        if supplier is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Поставщик не существует")

        if not supplier.is_active:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Поставщик не активен")

        products_ids = {
            p.id
            for p in self.db.scalars(
                select(Product).where(Product.is_active.is_(True))
            ).all()
        }

        unique_ids = {i.product_id for i in data.items}
        if len(data.items) > len(unique_ids):
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, "Товары повторяются"
            )

        if not all(i.product_id in products_ids for i in data.items):
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, "Товар не существует"
            )

        order = PurchaseOrder(supplier_id=data.supplier_id, comment=data.comment)

        items: list[PurchaseOrderItem] = []

        for item in data.items:
            items.append(
                PurchaseOrderItem(
                    product_id=item.product_id, qty=item.qty, price=item.price
                )
            )

        order.items = items
        self.db.add(order)

        try:
            self.db.commit()
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR, "Не удалось создать заказ"
            ) from exc

        self.db.refresh(order)
        return order

    def get_order(self, order_id: int) -> PurchaseOrder:
        statement = (
            select(PurchaseOrder)
            .where(PurchaseOrder.id == order_id)
            .options(selectinload(PurchaseOrder.items))
        )

        order = self.db.scalars(statement).first()

        if order is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Закупка не найдена")

        return order

    def list_orders(self) -> list[PurchaseOrder]:
        statement = (
            select(PurchaseOrder)
            .order_by(PurchaseOrder.created_at.desc())
            .options(selectinload(PurchaseOrder.items))
        )
        orders = self.db.scalars(statement).all()

        return list(orders)

    def send_order(self, id: int) -> PurchaseOrder:
        order = self.db.get(PurchaseOrder, id)

        if not order:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Заказ не найден")

        if order.status != Status.draft:
            raise HTTPException(status.HTTP_409_CONFLICT, "Заказ не черновик")

        order.status = Status.sent
        order.sent_at = datetime.now(UTC)

        try:
            self.db.commit()
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR, "Не удалось обновить заказ"
            ) from exc

        self.db.refresh(order)

        return order

    def receive_order(self, id: int) -> PurchaseOrder:
        statement = (
            select(PurchaseOrder)
            .where(PurchaseOrder.id == id)
            .options(selectinload(PurchaseOrder.items))
            .with_for_update()
        )

        order = self.db.scalars(statement).first()

        if not order:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Заказ не найден")

        if order.status != Status.sent:
            raise HTTPException(
                status.HTTP_409_CONFLICT, "Принимать можно только отправленный заказ"
            )

        product_ids = [item.product_id for item in order.items]

        stocks = self.db.scalars(
            select(Stock).where(Stock.product_id.in_(product_ids)).with_for_update()
        ).all()

        stock_by_product = {s.product_id: s for s in stocks}

        for item in order.items:
            stock = stock_by_product.get(item.product_id)

            if stock is None:
                stock = Stock(product_id=item.product_id, quantity=item.qty, reserved=0)

                self.db.add(stock)
                stock_by_product[item.product_id] = stock
            else:
                stock.quantity += item.qty

        order.status = Status.received
        order.received_at = datetime.now(UTC)

        try:
            self.db.commit()
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR, "Не удалось обновить заказ"
            ) from exc

        self.db.refresh(order)

        return order
