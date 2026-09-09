import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: str
    source_platform: str
    title: str
    brand: str | None
    product_url: str
    current_price_minor: int
    original_mrp_minor: int | None
    currency: str
    estimated_shipping_minor: int
    primary_image_url: str
    transparent_cutout_url: str | None
    in_stock_sizes: list[str]
    out_of_stock_sizes: list[str]
    is_available: bool
    gender: str
    primary_category: str
    sub_category: str | None
    color: str | None
    pattern: str | None
    occasions: list[str]
    source_updated_at: datetime


class ProjectCreate(BaseModel):
    project_name: str
    max_budget_minor: int
    currency: str = "INR"
    required_categories: list[str] = []
    event_description: str | None = None
    # Sent by guests only; ignored (overridden by the authenticated user) once signed in.
    guest_token: str | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    guest_token: str | None
    project_name: str
    max_budget_minor: int
    currency: str
    required_categories: list[str]
    event_description: str | None
    status: str
    created_at: datetime
    updated_at: datetime


class ProjectMigrateRequest(BaseModel):
    guest_token: str


class CurationRequest(BaseModel):
    # Sizes the user needs, e.g. {"Main Outfit": "M", "Footwear": "38"}. Optional per category.
    sizes: dict[str, str] = {}
    board_count: int = 3


class CurationItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product: ProductOut


class CurationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    project_id: uuid.UUID
    item_ids: list[str]
    total_price_minor: int
    shipping_total_minor: int
    compatibility_score: float
    is_custom_mix: bool
    created_at: datetime
    items: list[ProductOut] = []


class CustomMixRequest(BaseModel):
    item_ids: list[str]
