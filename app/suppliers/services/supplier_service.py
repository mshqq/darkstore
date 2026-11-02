from fastapi import HTTPException, status
from models import Supplier
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from suppliers.schemas import SupplierCreate, SupplierUpdate


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


def update_supplier(db: Session, supplier_id: int, data: SupplierUpdate) -> Supplier:
    supplier = db.get(Supplier, supplier_id)

    if supplier is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Поставщик не найден")

    changes = data.model_dump(exclude_unset=True)

    required_fields = ("name", "inn", "contact_person", "address", "phone")

    for field in required_fields:
        if field in changes and changes[field] is None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"Поле {field} не может быть null",
            )

    for field, value in changes.items():
        setattr(supplier, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Не удалось сохранить поставщика: конфликт данных"
        ) from None

    db.refresh(supplier)
    return supplier
