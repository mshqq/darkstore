from fastapi import HTTPException, status
from models import Supplier
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from suppliers.schemas import SupplierCreate


def list_suppliers(db: Session, include_inactive: bool = False) -> list[Supplier]:
    statement = select(Supplier).order_by(Supplier.name)

    if not include_inactive:
        statement = statement.where(Supplier.is_active.is_(True))

    return list(db.scalars(statement).all())


def create_supplier(db: Session, data: SupplierCreate) -> Supplier:

    supplier = Supplier(**data.model_dump())
    db.add(supplier)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Поставщик с таким названием или ИНН уже существует",
        ) from None

    db.refresh(supplier)
    return supplier
