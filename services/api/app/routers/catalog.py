from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductOut

router = APIRouter(prefix="/api/v1/catalog", tags=["catalog"])


@router.get("/products", response_model=list[ProductOut])
def list_products(
    category: str | None = Query(default=None),
    available_only: bool = Query(default=True),
    db: Session = Depends(get_db),
) -> list[Product]:
    stmt = select(Product)
    if category:
        stmt = stmt.where(Product.primary_category == category)
    if available_only:
        stmt = stmt.where(Product.is_available.is_(True))
    return list(db.scalars(stmt))


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)) -> Product:
    product = db.get(Product, product_id)
    if not product:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
