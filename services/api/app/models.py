import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    size_profile: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class VibeProfile(Base):
    __tablename__ = "vibe_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"))
    selected_vibes: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    style_vector: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Product(Base):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String, primary_key=True)
    source_platform: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    brand: Mapped[str | None] = mapped_column(String)
    product_url: Mapped[str] = mapped_column(Text, nullable=False)

    current_price_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    original_mrp_minor: Mapped[int | None] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String, default="INR")
    estimated_shipping_minor: Mapped[int] = mapped_column(Integer, default=0)

    primary_image_url: Mapped[str] = mapped_column(Text, nullable=False)
    transparent_cutout_url: Mapped[str | None] = mapped_column(Text)

    in_stock_sizes: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    out_of_stock_sizes: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    gender: Mapped[str] = mapped_column(String, default="Women")
    primary_category: Mapped[str] = mapped_column(String, nullable=False)
    sub_category: Mapped[str | None] = mapped_column(String)
    color: Mapped[str | None] = mapped_column(String)
    pattern: Mapped[str | None] = mapped_column(String)
    occasions: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    source_updated_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"))
    guest_token: Mapped[str | None] = mapped_column(String)

    project_name: Mapped[str] = mapped_column(String, nullable=False)
    max_budget_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="INR")
    required_categories: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    event_description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, default="draft")

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())

    curations: Mapped[list["OutfitCuration"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class OutfitCuration(Base):
    __tablename__ = "outfit_curations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    item_ids: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    total_price_minor: Mapped[int] = mapped_column(Integer, default=0)
    shipping_total_minor: Mapped[int] = mapped_column(Integer, default=0)
    compatibility_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    is_custom_mix: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    project: Mapped[Project] = relationship(back_populates="curations")
