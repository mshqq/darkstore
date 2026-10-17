"""Сид остатков товаров напрямую в БД (SQLAlchemy).

Запуск из папки бэкенда (рядом с models.py и database.py):
    python seed_stock.py

Выставляет АБСОЛЮТНЫЕ значения stock.quantity / stock.reserved,
поэтому повторный запуск безопасен: результат каждый раз одинаковый.
Запускать после seed.py (товары должны уже существовать).
"""

import random

from database import (
    SessionLocal,
)  # <- если у тебя фабрика сессий называется иначе, поправь
from models import Product, Stock
from sqlalchemy import select

random.seed(42)  # одинаковые остатки при каждом запуске


def pick_quantity(min_level: int) -> int:
    """Раскладка: часть товаров на нуле / ниже минимума, остальные в норме."""
    r = random.random()
    if r < 0.10:  # закончился
        return 0
    if r < 0.30:  # ниже минимума - для проверки low stock
        return max(1, int(min_level * random.uniform(0.2, 0.9)))
    if r < 0.85:  # нормальный запас
        return int(min_level * random.uniform(1.2, 3.0))
    return int(min_level * random.uniform(3.0, 5.0))  # избыток


def pick_reserved(quantity: int) -> int:
    """Часть товара зарезервирована под заказы (reserved <= quantity)."""
    if quantity == 0 or random.random() > 0.4:
        return 0
    return random.randint(1, max(1, quantity // 3))


def main() -> None:
    updated = zero = created_rows = 0

    with SessionLocal() as db:
        products = db.scalars(select(Product).order_by(Product.id)).all()
        if not products:
            raise SystemExit("Товаров нет. Сначала запусти seed.py")

        for p in products:
            stock = db.get(Stock, p.id)
            if stock is None:  # на случай товара без строки stock
                stock = Stock(product_id=p.id)
                db.add(stock)
                created_rows += 1

            qty = pick_quantity(p.min_level)
            stock.quantity = qty
            stock.reserved = pick_reserved(qty)

            updated += 1
            if qty == 0:
                zero += 1

        db.commit()

    print(
        f"Готово: остатки выставлены для {updated} товаров "
        f"(нулевых {zero}, новых строк stock {created_rows})"
    )


if __name__ == "__main__":
    main()
