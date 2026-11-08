from auth.dependencies import get_current_user
from database import DbSession
from fastapi import APIRouter, Depends, status
from models.supplier import Supplier

from suppliers.schemas import SupplierCreate, SupplierRead, SupplierUpdate
from suppliers.service import SuppliersService

router = APIRouter(
    prefix="/api/suppliers",
    tags=["suppliers"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[SupplierRead], status_code=status.HTTP_200_OK)
def get_suppliers(db: DbSession, include_inactive: bool = False) -> list[Supplier]:
    service = SuppliersService(db)
    return service.list_suppliers(include_inactive)


@router.post("", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
def create_supplier(data: SupplierCreate, db: DbSession) -> Supplier:
    service = SuppliersService(db)
    return service.create_supplier(data)


@router.patch(
    "/{supplier_id}", response_model=SupplierRead, status_code=status.HTTP_200_OK
)
def update_supplier(supplier_id: int, data: SupplierUpdate, db: DbSession) -> Supplier:
    service = SuppliersService(db)
    return service.update_supplier(supplier_id, data)
