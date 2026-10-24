from database import DbSession
from fastapi import APIRouter, status
from models import PurchaseOrder
from starlette.status import HTTP_200_OK
from suppliers.schemas import PurchaseOrderCreate, PurchaseOrderRead
from suppliers.services import order_service

router = APIRouter(prefix="/api/purchase-orders", tags=["purchase-orders"])


@router.get("", response_model=list[PurchaseOrderRead], status_code=status.HTTP_200_OK)
def get_orders(db: DbSession) -> list[PurchaseOrder]:
    return order_service.list_orders(db)


@router.post("", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_order(db: DbSession, data: PurchaseOrderCreate) -> PurchaseOrder:
    return order_service.create_order(db, data)


@router.post(
    "/{order_id}/send", response_model=PurchaseOrderRead, status_code=HTTP_200_OK
)
def send_order(db: DbSession, order_id: int) -> PurchaseOrder:
    return order_service.send_order(db, order_id)


@router.post(
    "/{order_id}/receive", response_model=PurchaseOrderRead, status_code=HTTP_200_OK
)
def receive_order(db: DbSession, order_id: int) -> PurchaseOrder:
    return order_service.receive_order(db, order_id)
