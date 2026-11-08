"""Демонстрационные данные. Запуск из app: uv run python -m scripts.seed_demo --replace-data.

Заменяет товары, поставщиков, остатки, закупки, продажи и клиентские заказы.
Схема и версия Alembic сохраняются. Перед запуском сделайте pg_dump.
"""

import argparse
from collections import Counter
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from database import SessionLocal
from models import (
    CustomerOrder,
    CustomerOrderItem,
    Product,
    PurchaseOrder,
    PurchaseOrderItem,
    Sale,
    SaleItem,
    Stock,
    Supplier,
)
from models.customer_order import CustomerOrderStatus
from models.product import Unit
from models.purchase_order import Status
from sqlalchemy import delete, func, select, text
from sqlalchemy.orm import Session


# Цены условные; названия организаций и контакты вымышленные.
SUPPLIERS = [
    ("ООО Молочный берег (демо)", "Анна Миронова"),
    ("ООО Хлебная мастерская (демо)", "Павел Белов"),
    ("ООО Урожай в упаковке (демо)", "Ирина Волкова"),
    ("ООО Бакалея плюс (демо)", "Олег Соколов"),
    ("ООО Напитки Востока (демо)", "Елена Орлова"),
    ("ООО Чистый дом (демо)", "Денис Лебедев"),
]

# Артикул, название, розничная цена, описание, индекс поставщика, единица.
PRODUCTS = [
    ("MILK-001", "Молоко 2,5% 900 мл", "99.90", "Пастеризованное молоко в бутылке 900 мл.", 0, Unit.PIECE),
    ("MILK-002", "Кефир 1% 900 мл", "109.90", "Кисломолочный напиток в бутылке 900 мл.", 0, Unit.PIECE),
    ("MILK-003", "Йогурт клубничный 125 г", "49.90", "Йогурт с клубничным наполнителем, стаканчик 125 г.", 0, Unit.PIECE),
    ("MILK-004", "Сметана 15% 300 г", "119.90", "Сметана в стакане 300 г.", 0, Unit.PIECE),
    ("MILK-005", "Творог 5% 180 г", "139.90", "Творог в индивидуальной упаковке 180 г.", 0, Unit.PIECE),
    ("MILK-006", "Сыр гауда 200 г", "229.90", "Полутвёрдый сыр, фасованная упаковка 200 г.", 0, Unit.PACK),
    ("BAKE-001", "Хлеб пшеничный 400 г", "59.90", "Пшеничный хлеб в нарезке, упаковка 400 г.", 1, Unit.PIECE),
    ("BAKE-002", "Хлеб ржаной 350 г", "69.90", "Ржаной хлеб в упаковке 350 г.", 1, Unit.PIECE),
    ("BAKE-003", "Багет классический 250 г", "79.90", "Пшеничный багет в бумажной упаковке.", 1, Unit.PIECE),
    ("BAKE-004", "Круассан с шоколадом 70 г", "89.90", "Слоёный круассан с шоколадной начинкой.", 1, Unit.PIECE),
    ("BAKE-005", "Печенье овсяное 250 г", "129.90", "Овсяное печенье в пачке 250 г.", 1, Unit.PACK),
    ("BAKE-006", "Сушки ванильные 200 г", "79.90", "Хрустящие сушки с ванильным ароматом.", 1, Unit.PACK),
    ("FRESH-001", "Бананы, упаковка 1 кг", "169.90", "Фасованные бананы. Одна позиция — упаковка 1 кг.", 2, Unit.PACK),
    ("FRESH-002", "Яблоки, упаковка 1 кг", "189.90", "Фасованные яблоки. Одна позиция — упаковка 1 кг.", 2, Unit.PACK),
    ("FRESH-003", "Огурцы, упаковка 500 г", "149.90", "Свежие огурцы в упаковке фиксированного веса.", 2, Unit.PACK),
    ("FRESH-004", "Томаты, упаковка 500 г", "179.90", "Свежие томаты в упаковке фиксированного веса.", 2, Unit.PACK),
    ("FRESH-005", "Картофель, упаковка 2 кг", "139.90", "Мытый картофель в сетке 2 кг.", 2, Unit.PACK),
    ("FRESH-006", "Морковь, упаковка 1 кг", "79.90", "Мытый корнеплод, фасованная упаковка 1 кг.", 2, Unit.PACK),
    ("FOOD-001", "Рис круглозёрный 900 г", "119.90", "Крупа рисовая в пачке 900 г.", 3, Unit.PACK),
    ("FOOD-002", "Гречка 800 г", "109.90", "Гречневая крупа ядрица, пачка 800 г.", 3, Unit.PACK),
    ("FOOD-003", "Спагетти 450 г", "99.90", "Макаронные изделия из твёрдых сортов пшеницы.", 3, Unit.PACK),
    ("FOOD-004", "Яйца С1, 10 штук", "139.90", "Упаковка из десяти куриных яиц категории С1.", 3, Unit.PACK),
    ("FOOD-005", "Шоколад молочный 90 г", "119.90", "Плитка молочного шоколада 90 г.", 3, Unit.PIECE),
    ("FOOD-006", "Тунец в собственном соку 185 г", "199.90", "Рыбные консервы в жестяной банке 185 г.", 3, Unit.PIECE),
    ("DRINK-001", "Вода питьевая 1,5 л", "49.90", "Негазированная питьевая вода в бутылке 1,5 л.", 4, Unit.PIECE),
    ("DRINK-002", "Вода газированная 500 мл", "39.90", "Газированная питьевая вода в бутылке 500 мл.", 4, Unit.PIECE),
    ("DRINK-003", "Сок яблочный 1 л", "139.90", "Восстановленный яблочный сок в картонной упаковке.", 4, Unit.PIECE),
    ("DRINK-004", "Морс клюквенный 1 л", "129.90", "Ягодный морс в бутылке 1 л.", 4, Unit.PIECE),
    ("DRINK-005", "Чай чёрный, 25 пакетиков", "149.90", "Чёрный чай в индивидуальных пакетиках.", 4, Unit.PACK),
    ("DRINK-006", "Кофе молотый 250 г", "399.90", "Обжаренный молотый кофе в герметичной пачке.", 4, Unit.PACK),
    ("HOME-001", "Средство для посуды 450 мл", "129.90", "Гель для ручного мытья посуды, флакон 450 мл.", 5, Unit.PIECE),
    ("HOME-002", "Мыло жидкое 300 мл", "109.90", "Жидкое мыло для рук с дозатором.", 5, Unit.PIECE),
    ("HOME-003", "Салфетки бумажные, 100 штук", "69.90", "Однослойные бумажные салфетки в пачке.", 5, Unit.PACK),
    ("HOME-004", "Губки для посуды, 5 штук", "79.90", "Набор из пяти двухслойных губок.", 5, Unit.PACK),
    ("HOME-005", "Пакеты для мусора 30 л, 20 штук", "99.90", "Рулон пакетов для бытового мусора.", 5, Unit.PACK),
    ("HOME-006", "Бумага туалетная, 4 рулона", "149.90", "Двухслойная туалетная бумага, упаковка четыре рулона.", 5, Unit.PACK),
]

# Статус, клиент, адрес, комментарий, пары (индекс товара, количество).
ORDERS = [
    ("new", "Анна Миронова", "ул. Ленина, 24, кв. 12", "Позвоните, когда подъедете.", [(0, 2), (6, 1), (21, 1)]),
    ("new", "Илья Кузнецов", "ул. Бутина, 38, кв. 7", None, [(12, 1), (13, 1), (26, 2)]),
    ("new", "Мария Белова", "ул. Чкалова, 15, кв. 31", "Домофон 31.", [(2, 4), (9, 2), (24, 2)]),
    ("picking", "Дмитрий Волков", "ул. Бабушкина, 42, кв. 18", None, [(18, 1), (20, 2), (23, 1)]),
    ("picking", "Екатерина Орлова", "ул. Амурская, 56, кв. 4", "Не звонить в дверь, ребёнок спит.", [(4, 2), (5, 1), (7, 1)]),
    ("ready", "Алексей Соколов", "ул. Шилова, 19, кв. 23", "Подъезд со двора.", [(14, 1), (15, 1), (16, 1)]),
    ("ready", "Ольга Павлова", "ул. Курнатовского, 8, кв. 9", None, [(27, 2), (22, 2), (10, 1)]),
    ("delivering", "Никита Морозов", "ул. Журавлёва, 61, кв. 16", "Курьеру: вход рядом с аптекой.", [(0, 1), (1, 1), (8, 2)]),
    ("delivering", "Софья Лебедева", "ул. Красной Звезды, 12, кв. 45", None, [(17, 1), (19, 1), (21, 1)]),
    ("delivered", "Артём Фролов", "ул. Ленина, 75, кв. 6", None, [(24, 3), (25, 2), (30, 1)]),
    ("delivered", "Полина Зайцева", "ул. Бутина, 11, кв. 28", "Оставить у двери по звонку.", [(3, 1), (11, 1), (28, 1)]),
    ("cancelled", "Максим Егоров", "ул. Чкалова, 32, кв. 14", "Демо: клиент отменил заказ до передачи курьеру.", [(29, 1), (31, 1)]),
]


def populate(db: Session) -> dict:
    now = datetime.now(UTC).replace(microsecond=0)
    # Блокируем запись на время замены, чтобы запрос API не создал заказ посередине.
    db.execute(text(
        "LOCK TABLE suppliers, products, stock, purchase_orders, purchase_order_items, "
        "sales, sale_items, customer_orders, customer_order_items IN ACCESS EXCLUSIVE MODE"
    ))
    for model in (CustomerOrderItem, CustomerOrder, SaleItem, Sale,
                  PurchaseOrderItem, PurchaseOrder, Stock, Product, Supplier):
        db.execute(delete(model))

    suppliers = []
    for i, (name, contact) in enumerate(SUPPLIERS):
        supplier = Supplier(
            name=name, inn=f"75000000{i + 1:02d}", contact_person=contact,
            address=f"г. Чита, Демонстрационная ул., {i + 1}",
            phone=f"+700000001{i:02d}", email=f"supplier{i + 1}@example.com",
            created_at=now - timedelta(days=30),
        )
        db.add(supplier)
        suppliers.append(supplier)
    db.flush()

    products = []
    for sku, name, price, description, supplier_index, unit in PRODUCTS:
        product = Product(
            sku=sku, name=name, selling_price=Decimal(price), description=description,
            unit=unit, min_level=5, default_supplier_id=suppliers[supplier_index].id,
            created_at=now - timedelta(days=20),
        )
        product.stock = Stock(quantity=0, reserved=0)
        db.add(product)
        products.append(product)
    db.flush()

    # Весь первоначальный запас объясняется шестью принятыми закупками.
    receipts = Counter()
    for supplier_index, supplier in enumerate(suppliers):
        purchase = PurchaseOrder(
            supplier_id=supplier.id, status=Status.received,
            comment="Демо: первоначальная поставка",
            created_at=now - timedelta(days=7), sent_at=now - timedelta(days=6),
            received_at=now - timedelta(days=5),
        )
        for i, product in enumerate(products):
            if PRODUCTS[i][4] != supplier_index:
                continue
            qty = {32: 2, 33: 4, 34: 1, 35: 0}.get(i, 18 + (i % 5) * 6)
            if qty == 0:
                continue
            purchase.items.append(PurchaseOrderItem(
                product_id=product.id, qty=qty,
                price=(product.selling_price * Decimal("0.70")).quantize(Decimal("0.01")),
            ))
            product.stock.quantity += qty
            receipts[product.id] += qty
        db.add(purchase)

    for supplier_index, purchase_status in ((0, Status.sent), (5, Status.draft)):
        purchase = PurchaseOrder(
            supplier_id=suppliers[supplier_index].id, status=purchase_status,
            comment="Демо: плановое пополнение",
            created_at=now - timedelta(hours=4),
            sent_at=now - timedelta(hours=3) if purchase_status == Status.sent else None,
        )
        for product in products[supplier_index * 6:supplier_index * 6 + 3]:
            purchase.items.append(PurchaseOrderItem(
                product_id=product.id, qty=12,
                price=(product.selling_price * Decimal("0.70")).quantize(Decimal("0.01")),
            ))
        db.add(purchase)

    # Прямые продажи отдельны от доставок и списываются только один раз.
    outgoing = Counter()
    for age, basket in enumerate(([(0, 2), (6, 1)], [(22, 2), (24, 1)], [(20, 1), (23, 1)])):
        sale = Sale(created_at=now - timedelta(days=2, hours=age))
        for index, qty in basket:
            product = products[index]
            sale.items.append(SaleItem(product_id=product.id, qty=qty, price=product.selling_price))
            product.stock.quantity -= qty
            outgoing[product.id] += qty
        db.add(sale)

    expected_reserved = Counter()
    for i, (status_value, name, address, comment, basket) in enumerate(ORDERS):
        order_status = CustomerOrderStatus(status_value)
        order = CustomerOrder(
            customer_name=name, phone=f"+700000002{i:02d}", address=f"г. Чита, {address}",
            comment=comment, status=order_status,
            created_at=now - timedelta(minutes=8 + i * 9),
        )
        for index, qty in basket:
            product = products[index]
            order.items.append(CustomerOrderItem(
                product_id=product.id, product_name=product.name,
                qty=qty, price=product.selling_price,
            ))
            if order_status in (CustomerOrderStatus.new, CustomerOrderStatus.picking, CustomerOrderStatus.ready):
                product.stock.reserved += qty
                expected_reserved[product.id] += qty
            elif order_status in (CustomerOrderStatus.delivering, CustomerOrderStatus.delivered):
                product.stock.quantity -= qty
                outgoing[product.id] += qty
        db.add(order)

    db.flush()
    for product in products:
        stock = product.stock
        if stock.reserved != expected_reserved[product.id]:
            raise ValueError(f"Резерв не совпал с заказами: {product.sku}")
        if stock.quantity != receipts[product.id] - outgoing[product.id]:
            raise ValueError(f"Не сошлись поступления и списания: {product.sku}")
        if not 0 <= stock.reserved <= stock.quantity:
            raise ValueError(f"Недопустимый остаток: {product.sku}")

    return {
        "suppliers": len(suppliers), "products": len(products),
        "purchase_orders": db.scalar(select(func.count()).select_from(PurchaseOrder)),
        "sales": 3, "customer_orders": dict(Counter(row[0] for row in ORDERS)),
        "reserved_units": sum(expected_reserved.values()),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--replace-data", action="store_true", help="Явно разрешить замену всех бизнес-данных")
    parser.add_argument("--dry-run", action="store_true", help="Проверить наполнение и откатить транзакцию")
    args = parser.parse_args()
    if not args.replace_data:
        parser.error("Нужен --replace-data. Сначала сохраните резервную копию базы.")
    with SessionLocal() as db:
        try:
            summary = populate(db)
            if args.dry_run:
                db.rollback()
                print("Проверка прошла, изменения отменены.")
            else:
                db.commit()
                print("Демонстрационные данные сохранены.")
        except Exception:
            db.rollback()
            raise
    print(summary)


if __name__ == "__main__":
    main()
