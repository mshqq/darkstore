from fastapi import HTTPException, status
from models.supplier import Supplier
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from suppliers.schemas import SupplierCreate, SupplierUpdate


class SuppliersService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_suppliers(self, include_inactive: bool = False) -> list[Supplier]:
        statement = select(Supplier).order_by(Supplier.name)

        if not include_inactive:
            statement = statement.where(Supplier.is_active.is_(True))

        return list(self.db.scalars(statement).all())

    def create_supplier(self, data: SupplierCreate) -> Supplier:

        supplier = Supplier(**data.model_dump())
        self.db.add(supplier)

        try:
            self.db.commit()

        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Поставщик с таким названием или ИНН уже существует",
            ) from None

        self.db.refresh(supplier)
        return supplier

    def update_supplier(self, supplier_id: int, data: SupplierUpdate) -> Supplier:
        supplier = self.db.get(Supplier, supplier_id)

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
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                "Не удалось сохранить поставщика: конфликт данных",
            ) from None

        self.db.refresh(supplier)
        return supplier
