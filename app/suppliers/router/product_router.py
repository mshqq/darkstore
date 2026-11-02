from database import DbSession
from fastapi import APIRouter, UploadFile, status
from models import Product

from suppliers.schemas import ProductCreate, ProductRead, ProductUpdate
from suppliers.services import product_service

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductRead], status_code=status.HTTP_200_OK)
def get_products(
    db: DbSession, include_inactive: bool = False, search: str | None = None
) -> list[Product]:
    return product_service.list_products(db, search, include_inactive)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_products(db: DbSession, data: ProductCreate) -> Product:
    return product_service.create_product(db, data)


@router.patch(
    "/{product_id}", response_model=ProductRead, status_code=status.HTTP_200_OK
)
def update_product(product_id: int, data: ProductUpdate, db: DbSession) -> Product:
    return product_service.update_product(db, product_id, data)


@router.post(
    "/{product_id}/image", response_model=ProductRead, status_code=status.HTTP_200_OK
)
def upload_product_image(product_id: int, file: UploadFile, db: DbSession) -> Product:
    return product_service.upload_product_image(db, product_id, file)
