from io import BytesIO
from uuid import uuid4

from config import settings
from fastapi import HTTPException, UploadFile, status
from models.product import Product
from models.stock import Stock
from models.supplier import Supplier
from PIL import Image, UnidentifiedImageError
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from products.schemas import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_products(
        self, search: str | None = None, include_inactive: bool = False
    ) -> list[Product]:
        statement = select(Product).order_by(Product.name)

        if not include_inactive:
            statement = statement.where(Product.is_active.is_(True))

        if search:
            pattern = f"%{search.strip()}%"
            statement = statement.where(
                or_(Product.name.ilike(pattern), Product.sku.ilike(pattern))
            )

        return list(self.db.scalars(statement).all())

    def update_product(self, product_id: int, data: ProductUpdate) -> Product:
        product = self.db.get(Product, product_id)

        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Товар не найден")

        changes = data.model_dump(exclude_unset=True)

        for field in ("name", "sku", "min_level"):
            if field in changes and changes[field] is None:
                raise HTTPException(
                    status.HTTP_422_UNPROCESSABLE_CONTENT,
                    f"Поле {field} не может быть null",
                )

        supplier_id = changes.get("default_supplier_id")

        if supplier_id is not None:
            supplier = self.db.get(Supplier, supplier_id)

            if supplier is None:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "Поставщик не найден")

            if not supplier.is_active:
                raise HTTPException(status.HTTP_400_BAD_REQUEST, "Поставщик не активен")

        for field, value in changes.items():
            setattr(product, field, value)

        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status.HTTP_409_CONFLICT, "Не удалось сохранить товар: конфликт данных"
            ) from None

        self.db.refresh(product)
        return product

    def create_product(self, data: ProductCreate) -> Product:
        if (
            data.default_supplier_id is not None
            and self.db.get(Supplier, data.default_supplier_id) is None
        ):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Поставщик не существует")

        product = Product(**data.model_dump())
        product.stock = Stock()
        self.db.add(product)
        try:
            self.db.commit()
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="Артикул занят"
            ) from None

        self.db.refresh(product)
        return product

    def upload_product_image(self, product_id: int, file: UploadFile) -> Product:
        product = self.db.get(Product, product_id)

        if product is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Товар не найден")

        MAX_SIZE = 5 * 1024 * 1024
        content = file.file.read(MAX_SIZE + 1)

        if len(content) > MAX_SIZE:
            raise HTTPException(
                status.HTTP_413_CONTENT_TOO_LARGE,
                "Максимальный размер изображения - 5 МБ",
            )

        output = BytesIO()

        try:
            with Image.open(BytesIO(content)) as image:
                if image.format not in {"JPEG", "PNG", "WEBP"}:
                    raise HTTPException(
                        status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                        "Допустимы JPEG, PNG, WebP",
                    )

                if image.width * image.height > 20_000_000:
                    raise HTTPException(
                        status.HTTP_413_CONTENT_TOO_LARGE,
                        "Изображение слишком большое: максимум 20 мегапикселей",
                    )

                image = image.convert("RGBA")
                image.thumbnail((1600, 1600))
                image.save(output, format="WEBP", quality=85)
        except (
            UnidentifiedImageError,
            Image.DecompressionBombError,
            OSError,
            ValueError,
        ) as exc:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, "Не удалось прочитать изображение"
            ) from exc

        filename = f"{uuid4().hex}.webp"
        path = settings.images_dir / filename

        try:
            path.write_bytes(output.getvalue())
            product.image_url = f"/static/images/{filename}"
            self.db.commit()
        except Exception:
            self.db.rollback()
            path.unlink(missing_ok=True)
            raise

        self.db.refresh(product)
        return product
