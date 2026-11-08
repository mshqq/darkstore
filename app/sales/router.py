from auth.dependencies import get_current_user
from database import DbSession
from fastapi import APIRouter, Depends, status
from models.sale import Sale

from sales.schemas import SaleCreate, SaleRead
from sales.service import SaleService

router = APIRouter(
    prefix="/api/sales", tags=["sales"], dependencies=[Depends(get_current_user)]
)


@router.get("", response_model=list[SaleRead], status_code=status.HTTP_200_OK)
def list_sales(db: DbSession) -> list[Sale]:
    service = SaleService(db)
    return service.list_sales()


@router.get("/{sale_id}", response_model=SaleRead, status_code=status.HTTP_200_OK)
def get_sale(sale_id: int, db: DbSession) -> Sale:
    service = SaleService(db)
    return service.get_sale(sale_id)


@router.post("", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_sale(data: SaleCreate, db: DbSession) -> Sale:
    service = SaleService(db)
    return service.create_sale(data)
