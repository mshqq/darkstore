"""Сид остатков товаров через HTTP-запросы к API даркстора.

Запуск:  python seed_stock.py [http://localhost:8000]
Запускать после seed.py (товары должны уже существовать).
Только стандартная библиотека.

ВАЖНО: эндпоинт и формат тела для остатков в seed.py не видны,
поэтому они вынесены в STOCK_PATH и build_payload() - поправь под свой API.
Если эндпоинт - это "приход" (receipt), повторный запуск добавит остатки ещё раз.
"""

import json
import random
import sys
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000").rstrip("/")

# --- ПОДСТАВИТЬ ПОД СВОЙ API ------------------------------------------------
STOCK_PATH = "/api/stock/receipts"


def build_payload(product: dict, qty: float) -> dict:
    return {
        "product_id": product["id"],
        "quantity": qty,
    }


# -----------------------------------------------------------------------------

random.seed(42)  # одинаковые остатки при каждом запуске


def request(method: str, path: str, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        BASE + path,
        data=data,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, raw


def pick_quantity(min_level: float, unit: str) -> float:
    """Раскладка: часть товаров на нуле / ниже минимума, остальные в норме."""
    r = random.random()
    if r < 0.10:  # закончился
        factor = 0.0
    elif r < 0.30:  # ниже минимума - для проверки уведомлений о low stock
        factor = random.uniform(0.2, 0.9)
    elif r < 0.85:  # нормальный запас
        factor = random.uniform(1.2, 3.0)
    else:  # с избытком
        factor = random.uniform(3.0, 5.0)

    qty = min_level * factor
    if unit == "кг":
        return round(qty, 1)
    return float(int(qty))


def main() -> None:
    code, products = request("GET", "/api/products")
    if code != 200:
        sys.exit(f"Не удалось получить товары: {code} {products}")

    created = skipped = failed = 0
    for p in products:
        qty = pick_quantity(p.get("min_level") or 0, p.get("unit", "шт"))
        if qty <= 0:
            skipped += 1  # нулевой остаток = отсутствие прихода
            continue
        code, resp = request("POST", STOCK_PATH, build_payload(p, qty))
        if code in (200, 201):
            created += 1
        else:
            failed += 1
            print(f"  ! {p.get('sku')} {p.get('name')}: {code} {resp}")

    print(
        f"Готово: остатки созданы для {created}, "
        f"нулевых (без прихода) {skipped}, ошибок {failed}"
    )


if __name__ == "__main__":
    main()
