"""Load fixtures/products.json into the `products` table.

Run after migrations are applied:
    cd services/api
    python -m scripts.seed_products
"""

import json
from pathlib import Path

from sqlalchemy.dialects.postgresql import insert

from app.database import SessionLocal
from app.models import Product

FIXTURES_PATH = Path(__file__).resolve().parent.parent / "fixtures" / "products.json"


def main() -> None:
    products = json.loads(FIXTURES_PATH.read_text())
    db = SessionLocal()
    try:
        for record in products:
            stmt = insert(Product).values(**record)
            stmt = stmt.on_conflict_do_update(
                index_elements=[Product.product_id],
                set_={key: stmt.excluded[key] for key in record if key != "product_id"},
            )
            db.execute(stmt)
        db.commit()
        print(f"Seeded {len(products)} products.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
