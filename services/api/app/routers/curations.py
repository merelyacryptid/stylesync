import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import OutfitCuration, Product
from app.routers.projects import _get_owned_project
from app.schemas import CurationOut, CurationRequest, CustomMixRequest
from app.security import Identity, get_identity
from app.services.recommendation import generate_boards

router = APIRouter(prefix="/api/v1/projects/{project_id}/curations", tags=["curations"])


def _to_curation_out(curation: OutfitCuration, db: Session) -> CurationOut:
    items = list(db.scalars(select(Product).where(Product.product_id.in_(curation.item_ids))))
    data = CurationOut.model_validate(curation)
    data.items = items
    return data


@router.post("/generate", response_model=list[CurationOut], status_code=status.HTTP_201_CREATED)
def generate_curations(
    project_id: uuid.UUID,
    payload: CurationRequest,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> list[CurationOut]:
    project = _get_owned_project(project_id, identity, db)

    catalog = list(db.scalars(select(Product).where(Product.is_available.is_(True))))
    boards = generate_boards(
        products=catalog,
        required_categories=project.required_categories,
        event_description=project.event_description,
        budget_minor=project.max_budget_minor,
        sizes=payload.sizes,
        board_count=payload.board_count,
    )
    if not boards:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No combination of catalog items fits this budget/size/category combination yet.",
        )

    created: list[OutfitCuration] = []
    for items, score in boards:
        total_price = sum(p.current_price_minor for p in items)
        total_shipping = sum(p.estimated_shipping_minor for p in items)
        curation = OutfitCuration(
            project_id=project.id,
            item_ids=[p.product_id for p in items],
            total_price_minor=total_price,
            shipping_total_minor=total_shipping,
            compatibility_score=score,
            is_custom_mix=False,
        )
        db.add(curation)
        created.append(curation)

    db.commit()
    for curation in created:
        db.refresh(curation)
    return [_to_curation_out(c, db) for c in created]


@router.get("", response_model=list[CurationOut])
def list_curations(
    project_id: uuid.UUID,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> list[CurationOut]:
    project = _get_owned_project(project_id, identity, db)
    curations = list(db.scalars(select(OutfitCuration).where(OutfitCuration.project_id == project.id)))
    return [_to_curation_out(c, db) for c in curations]


@router.post("/custom-mix", response_model=CurationOut, status_code=status.HTTP_201_CREATED)
def save_custom_mix(
    project_id: uuid.UUID,
    payload: CustomMixRequest,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> CurationOut:
    """Persist a Mix-n-Match Studio selection: any set of product IDs the user dragged together,
    regardless of which generated board they originally came from."""
    project = _get_owned_project(project_id, identity, db)

    items = list(db.scalars(select(Product).where(Product.product_id.in_(payload.item_ids))))
    if len(items) != len(payload.item_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more product IDs are invalid")

    total_price = sum(p.current_price_minor for p in items)
    total_shipping = sum(p.estimated_shipping_minor for p in items)

    curation = OutfitCuration(
        project_id=project.id,
        item_ids=[p.product_id for p in items],
        total_price_minor=total_price,
        shipping_total_minor=total_shipping,
        compatibility_score=0,  # Recomputed client-side/live; persisted score is informational only.
        is_custom_mix=True,
    )
    db.add(curation)
    db.commit()
    db.refresh(curation)
    return _to_curation_out(curation, db)


@router.post("/{curation_id}/mark-bought", response_model=CurationOut)
def mark_bought(
    project_id: uuid.UUID,
    curation_id: uuid.UUID,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> CurationOut:
    project = _get_owned_project(project_id, identity, db)
    curation = db.get(OutfitCuration, curation_id)
    if not curation or curation.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curation not found")

    project.status = "bought"
    db.commit()
    db.refresh(curation)
    return _to_curation_out(curation, db)
