from auth.dependencies import get_current_user
from database import DbSession
from fastapi import APIRouter, Depends, UploadFile, status
from models.product import Product

from products.schemas import ProductCreate, ProductRead, ProductUpdate
from products.service import ProductService

router = APIRouter(
    prefix="/api/products", tags=["products"], dependencies=[Depends(get_current_user)]
)


@router.get("", response_model=list[ProductRead], status_code=status.HTTP_200_OK)
def get_products(
    db: DbSession, include_inactive: bool = False, search: str | None = None
) -> list[Product]:
    service = ProductService(db)
    return service.list_products(search, include_inactive)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_products(db: DbSession, data: ProductCreate) -> Product:
    service = ProductService(db)
    return service.create_product(data)


@router.patch(
    "/{product_id}", response_model=ProductRead, status_code=status.HTTP_200_OK
)
def update_product(product_id: int, data: ProductUpdate, db: DbSession) -> Product:
    service = ProductService(db)
    return service.update_product(product_id, data)


@router.post(
    "/{product_id}/image", response_model=ProductRead, status_code=status.HTTP_200_OK
)
def upload_product_image(product_id: int, file: UploadFile, db: DbSession) -> Product:
    service = ProductService(db)
    return service.upload_product_image(product_id, file)
