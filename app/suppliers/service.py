from fastapi import HTTPException, status
from models import Product, Stock, Supplier
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from suppliers.schemas import ProductCreate, SupplierCreate


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


def list_products(
    db: Session, search: str | None = None, include_inactive: bool = False
) -> list[Product]:
    statement = select(Product).order_by(Product.name)

    if not include_inactive:
        statement.where(Product.is_active.is_(True))

    if search:
        pattern = f"%{search.strip()}%"
        statement = statement.where(
            or_(Product.name.ilike(pattern), Product.sku.ilike(pattern))
        )

    return list(db.scalars(statement).all())


def create_product(db: Session, data: ProductCreate) -> Product:
    if (
        data.default_supplier_id is not None
        and db.get(Supplier, data.default_supplier_id) is None
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Поставщик не существует")

    product = Product(**data.model_dump())
    product.stock = Stock()
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Артикул занят"
        ) from None

    db.refresh(product)
    return product
