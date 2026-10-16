from database import DbSession
from fastapi import APIRouter, status
from models import Product
from suppliers import service
from suppliers.schemas import ProductCreate, ProductRead

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductRead], status_code=status.HTTP_200_OK)
def get_products(
    db: DbSession, include_inactive: bool = False, search: str | None = None
) -> list[Product]:
    return service.list_products(db, search, include_inactive)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_products(db: DbSession, data: ProductCreate) -> Product:
    return service.create_product(db, data)
