from auth.dependencies import get_current_user
from database import DbSession
from fastapi import APIRouter, Depends, status

from inventory.schemas import StockRead
from inventory.service import StockService

router = APIRouter(
    prefix="/api/stock", tags=["stock"], dependencies=[Depends(get_current_user)]
)


@router.get("", response_model=list[StockRead], status_code=status.HTTP_200_OK)
def get_stocks(
    db: DbSession,
    only_low: bool = False,
    include_inactive: bool = False,
):
    service = StockService(db)
    return service.list_stock(only_low, include_inactive)
