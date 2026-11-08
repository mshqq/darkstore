from auth.dependencies import get_current_user
from database import DbSession
from fastapi import APIRouter, Depends, status
from models.customer_order import CustomerOrder

from orders import service
from orders.schemas import CustomerOrderCreate, CustomerOrderRead

router = APIRouter(
    prefix="/api/customer-orders",
    tags=["customer-orders"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", response_model=CustomerOrderRead, status_code=status.HTTP_201_CREATED)
def create_order(data: CustomerOrderCreate, db: DbSession) -> CustomerOrder:
    return service.create_order(db, data)


@router.get("", response_model=list[CustomerOrderRead], status_code=status.HTTP_200_OK)
def list_orders(db: DbSession) -> list[CustomerOrder]:
    return service.list_orders(db)


@router.get(
    "/{order_id}", response_model=CustomerOrderRead, status_code=status.HTTP_200_OK
)
def get_order(order_id: int, db: DbSession) -> CustomerOrder:
    return service.get_order(db, order_id)


@router.post(
    "/{order_id}/cancel",
    response_model=CustomerOrderRead,
    status_code=status.HTTP_200_OK,
)
def cancel_order(order_id: int, db: DbSession) -> CustomerOrder:
    return service.cancel_order(db, order_id)


@router.post(
    "/{order_id}/start-picking",
    response_model=CustomerOrderRead,
    status_code=status.HTTP_200_OK,
)
def start_picking(order_id: int, db: DbSession) -> CustomerOrder:
    return service.start_picking(db, order_id)


@router.post(
    "/{order_id}/finish-picking",
    response_model=CustomerOrderRead,
    status_code=status.HTTP_200_OK,
)
def finish_picking(order_id: int, db: DbSession) -> CustomerOrder:
    return service.finish_picking(db, order_id)


@router.post(
    "/{order_id}/start-delivery",
    response_model=CustomerOrderRead,
    status_code=status.HTTP_200_OK,
)
def start_delivery(order_id: int, db: DbSession) -> CustomerOrder:
    return service.start_delivery(db, order_id)


@router.post(
    "/{order_id}/finish-delivery",
    response_model=CustomerOrderRead,
    status_code=status.HTTP_200_OK,
)
def finish_delivery(order_id: int, db: DbSession) -> CustomerOrder:
    return service.finish_delivery(db, order_id)
