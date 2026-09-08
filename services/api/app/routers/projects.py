import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project
from app.schemas import ProjectCreate, ProjectMigrateRequest, ProjectOut
from app.security import Identity, get_identity

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> Project:
    if not identity.is_authenticated:
        # Guests get exactly one project (ADR 0003). If one already exists for this guest
        # token, hand it back instead of silently creating a second.
        existing = db.scalar(select(Project).where(Project.guest_token == identity.guest_token))
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Guests may only have one project. Sign in to start another.",
            )

    project = Project(
        user_id=identity.user_id,
        guest_token=None if identity.is_authenticated else identity.guest_token,
        project_name=payload.project_name,
        max_budget_minor=payload.max_budget_minor,
        currency=payload.currency,
        required_categories=payload.required_categories,
        event_description=payload.event_description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=list[ProjectOut])
def list_projects(identity: Identity = Depends(get_identity), db: Session = Depends(get_db)) -> list[Project]:
    if identity.is_authenticated:
        stmt = select(Project).where(Project.user_id == identity.user_id)
    else:
        stmt = select(Project).where(Project.guest_token == identity.guest_token)
    return list(db.scalars(stmt))


def _get_owned_project(project_id: uuid.UUID, identity: Identity, db: Session) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    owns = (identity.is_authenticated and project.user_id == identity.user_id) or (
        not identity.is_authenticated and project.guest_token == identity.guest_token
    )
    if not owns:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your project")
    return project


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: uuid.UUID,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> Project:
    return _get_owned_project(project_id, identity, db)


@router.post("/migrate", response_model=list[ProjectOut])
def migrate_guest_projects(
    payload: ProjectMigrateRequest,
    identity: Identity = Depends(get_identity),
    db: Session = Depends(get_db),
) -> list[Project]:
    """Attach any project created anonymously under `guest_token` to the now-authenticated user.

    Call this right after sign-in/sign-up, passing the guest token that was stored client-side.
    """
    if not identity.is_authenticated:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in first")

    projects = list(db.scalars(select(Project).where(Project.guest_token == payload.guest_token)))
    for project in projects:
        project.user_id = identity.user_id
        project.guest_token = None
    db.commit()
    for project in projects:
        db.refresh(project)
    return projects
