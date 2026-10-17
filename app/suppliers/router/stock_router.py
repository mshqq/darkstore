from database import DbSession
from fastapi import APIRouter, status
from suppliers.schemas import StockRead
from suppliers.services import stock_service

router = APIRouter(prefix="/api/stock", tags=["stock"])


@router.get("", response_model=list[StockRead], status_code=status.HTTP_200_OK)
def get_stocks(
    db: DbSession,
    only_low: bool = False,
    include_inactive: bool = False,
):
    return stock_service.list_stock(db, only_low, include_inactive)
