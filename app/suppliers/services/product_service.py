from fastapi import HTTPException, status
from models import Product, Stock, Supplier
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from suppliers.schemas import ProductCreate


def list_products(
    db: Session, search: str | None = None, include_inactive: bool = False
) -> list[Product]:
    statement = select(Product).order_by(Product.name)

    if not include_inactive:
        statement = statement.where(Product.is_active.is_(True))

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
