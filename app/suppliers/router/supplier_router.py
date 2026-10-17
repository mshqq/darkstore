from database import DbSession
from fastapi import APIRouter, status
from models import Supplier
from suppliers.schemas import SupplierCreate, SupplierRead
from suppliers.services import supplier_service

router = APIRouter(prefix="/api/suppliers", tags=["suppliers"])


@router.get("", response_model=list[SupplierRead], status_code=status.HTTP_200_OK)
def get_suppliers(db: DbSession, include_inactive: bool = False) -> list[Supplier]:
    return supplier_service.list_suppliers(db, include_inactive)


@router.post("", response_model=SupplierRead, status_code=status.HTTP_201_CREATED)
def create_supplier(data: SupplierCreate, db: DbSession) -> Supplier:
    return supplier_service.create_supplier(db, data)
