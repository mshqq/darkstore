from datetime import UTC, datetime

from fastapi import HTTPException, status
from models import Product, PurchaseOrder, PurchaseOrderItem, Status, Stock, Supplier
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.session import Session
from suppliers.schemas import PurchaseOrderCreate


def create_order(db: Session, data: PurchaseOrderCreate) -> PurchaseOrder:
    supplier = db.get(Supplier, data.supplier_id)

    if supplier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Поставщик не существует")

    if not supplier.is_active:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Поставщик не активен")

    products_ids = {
        p.id
        for p in db.scalars(select(Product).where(Product.is_active.is_(True))).all()
    }

    unique_ids = {i.product_id for i in data.items}
    if len(data.items) > len(unique_ids):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Товары повторяются")

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
    db.add(order)

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Не удалось создать заказ"
        ) from exc

    db.refresh(order)
    return order


def list_orders(db: Session) -> list[PurchaseOrder]:
    statement = (
        select(PurchaseOrder)
        .order_by(PurchaseOrder.created_at.desc())
        .options(selectinload(PurchaseOrder.items))
    )
    orders = db.scalars(statement).all()

    return list(orders)


def send_order(db: Session, id: int) -> PurchaseOrder:
    order = db.get(PurchaseOrder, id)

    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заказ не найден")

    if order.status != Status.draft:
        raise HTTPException(status.HTTP_409_CONFLICT, "Заказ не черновик")

    order.status = Status.sent
    order.sent_at = datetime.now(UTC)

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Не удалось обновить заказ"
        ) from exc

    db.refresh(order)

    return order


def receive_order(db: Session, id: int) -> PurchaseOrder:
    statement = (
        select(PurchaseOrder)
        .where(PurchaseOrder.id == id)
        .options(selectinload(PurchaseOrder.items))
        .with_for_update()
    )

    order = db.scalars(statement).first()

    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Заказ не найден")

    if order.status != Status.sent:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Принимать можно только отправленный заказ"
        )

    product_ids = [item.product_id for item in order.items]

    stocks = db.scalars(
        select(Stock).where(Stock.product_id.in_(product_ids)).with_for_update()
    ).all()

    stock_by_product = {s.product_id: s for s in stocks}

    for item in order.items:
        stock = stock_by_product.get(item.product_id)

        if stock is None:
            stock = Stock(product_id=item.product_id, quantity=item.qty, reserved=0)

            db.add(stock)
            stock_by_product[item.product_id] = stock
        else:
            stock.quantity += item.qty

    order.status = Status.received
    order.received_at = datetime.now(UTC)

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Не удалось обновить заказ"
        ) from exc

    db.refresh(order)

    return order
