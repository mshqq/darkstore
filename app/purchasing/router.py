from auth.dependencies import get_current_user
from database import DbSession
from fastapi import APIRouter, Depends, status
from models.purchase_order import PurchaseOrder
from starlette.status import HTTP_200_OK

from purchasing.schemas import PurchaseOrderCreate, PurchaseOrderRead
from purchasing.service import PurchasingService

router = APIRouter(
    prefix="/api/purchase-orders",
    tags=["purchase-orders"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[PurchaseOrderRead], status_code=status.HTTP_200_OK)
def get_orders(db: DbSession) -> list[PurchaseOrder]:
    service = PurchasingService(db)
    return service.list_orders()


@router.get("/{order_id}", response_model=PurchaseOrderRead)
def get_order(order_id: int, db: DbSession) -> PurchaseOrder:
    service = PurchasingService(db)
    return service.get_order(order_id)


@router.post("", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_order(db: DbSession, data: PurchaseOrderCreate) -> PurchaseOrder:
    service = PurchasingService(db)
    return service.create_order(data)


@router.post(
    "/{order_id}/send", response_model=PurchaseOrderRead, status_code=HTTP_200_OK
)
def send_order(db: DbSession, order_id: int) -> PurchaseOrder:
    service = PurchasingService(db)
    return service.send_order(order_id)


@router.post(
    "/{order_id}/receive", response_model=PurchaseOrderRead, status_code=HTTP_200_OK
)
def receive_order(db: DbSession, order_id: int) -> PurchaseOrder:
    service = PurchasingService(db)
    return service.receive_order(order_id)
