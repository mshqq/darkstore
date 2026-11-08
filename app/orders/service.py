from fastapi import HTTPException, status
from inventory.service import StockService
from models.customer_order import CustomerOrder, CustomerOrderStatus
from models.customer_order_item import CustomerOrderItem
from models.product import Product
from models.stock import Stock
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from orders.schemas import CustomerOrderCreate


def create_order(db: Session, data: CustomerOrderCreate) -> CustomerOrder:
    product_ids = [item.product_id for item in data.items]

    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Товары в заказе не должны повторяться",
        )

    quantities = {item.product_id: item.qty for item in data.items}

    try:
        stock_service = StockService(db)
        products_by_id, stocks_by_id = stock_service.lock_and_validate_stock(quantities)

        order = CustomerOrder(
            customer_name=data.customer_name,
            phone=data.phone,
            address=data.address,
            comment=data.comment,
        )

        for item in data.items:
            product: Product = products_by_id[item.product_id]
            stock: Stock = stocks_by_id[item.product_id]

            stock.reserved += item.qty

            order.items.append(
                CustomerOrderItem(
                    product_id=product.id,
                    product_name=product.name,
                    qty=item.qty,
                    price=product.selling_price,
                )
            )

        db.add(order)
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


def list_orders(db: Session) -> list[CustomerOrder]:
    orders = db.scalars(
        select(CustomerOrder)
        .options(selectinload(CustomerOrder.items))
        .order_by(CustomerOrder.id.desc())
    ).all()

    return list(orders)


def get_order(db: Session, order_id: int) -> CustomerOrder:
    order = db.scalar(
        select(CustomerOrder)
        .where(CustomerOrder.id == order_id)
        .options(selectinload(CustomerOrder.items))
    )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден"
        )

    return order


def cancel_order(db: Session, order_id: int) -> CustomerOrder:
    try:
        order = db.scalar(
            select(CustomerOrder)
            .where(CustomerOrder.id == order_id)
            .options(selectinload(CustomerOrder.items))
            .with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден"
            )

        if order.status == CustomerOrderStatus.cancelled:
            db.rollback()
            return order

        if (
            order.status == CustomerOrderStatus.delivering
            or order.status == CustomerOrderStatus.delivered
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Нельзя отменить заказ после передачи курьеру",
            )

        product_ids: list[int] = [item.product_id for item in order.items]

        stocks = db.scalars(
            select(Stock)
            .where(Stock.product_id.in_(product_ids))
            .order_by(Stock.product_id)
            .with_for_update()
        ).all()
        stocks_by_id: dict[int, Stock] = {stock.product_id: stock for stock in stocks}

        for item in order.items:
            stock = stocks_by_id.get(item.product_id)

            if stock is None or stock.reserved < item.qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Нарушен резерв заказа"
                )

            stock.reserved -= item.qty

        order.status = CustomerOrderStatus.cancelled

        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


def start_picking(db: Session, order_id: int) -> CustomerOrder:
    try:
        order = db.scalar(
            select(CustomerOrder).where(CustomerOrder.id == order_id).with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден"
            )

        if order.status != CustomerOrderStatus.new:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Начать сборку можно только для нового заказа",
            )

        order.status = CustomerOrderStatus.picking
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


def finish_picking(db: Session, order_id: int) -> CustomerOrder:
    try:
        order = db.scalar(
            select(CustomerOrder).where(CustomerOrder.id == order_id).with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден"
            )

        if order.status != CustomerOrderStatus.picking:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Завершить сборку можно только для заказа в сборке",
            )

        order.status = CustomerOrderStatus.ready
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


def start_delivery(db: Session, order_id: int) -> CustomerOrder:
    try:
        order = db.scalar(
            select(CustomerOrder)
            .where(CustomerOrder.id == order_id)
            .options(selectinload(CustomerOrder.items))
            .with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден"
            )

        if order.status != CustomerOrderStatus.ready:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Передать курьеру можно только собранный заказ",
            )

        product_ids: list[int] = [item.product_id for item in order.items]

        stocks = db.scalars(
            select(Stock)
            .where(Stock.product_id.in_(product_ids))
            .order_by(Stock.product_id)
            .with_for_update()
        ).all()
        stocks_by_id: dict[int, Stock] = {stock.product_id: stock for stock in stocks}

        for item in order.items:
            stock = stocks_by_id.get(item.product_id)
            if stock is None or stock.reserved < item.qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Нарушен резерв заказа"
                )

            stock.quantity -= item.qty
            stock.reserved -= item.qty

        order.status = CustomerOrderStatus.delivering
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order


def finish_delivery(db: Session, order_id: int) -> CustomerOrder:
    try:
        order = db.scalar(
            select(CustomerOrder).where(CustomerOrder.id == order_id).with_for_update()
        )

        if order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Заказ не найден"
            )

        if order.status != CustomerOrderStatus.delivering:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Завершить доставку можно только для заказа в доставке",
            )

        order.status = CustomerOrderStatus.delivered
        db.commit()

    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return order
