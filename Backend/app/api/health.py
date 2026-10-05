from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.schemas.health import HealthResponse, ReadinessResponse
from app.services import health_service

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Liveness check")
def health() -> HealthResponse:
    """Liveness probe. Intentionally does not touch Supabase."""
    settings = get_settings()
    return HealthResponse(status="ok", service=settings.app_name, version=settings.app_version)


@router.get(
    "/health/ready",
    response_model=ReadinessResponse,
    summary="Readiness check (Supabase database + API)",
    responses={503: {"description": "A dependency is unavailable"}},
)
def ready(db: Session = Depends(get_db)) -> ReadinessResponse:
    """Verifies the backend can reach Supabase PostgreSQL and the Supabase API."""
    return ReadinessResponse(status="ok", checks=health_service.readiness(db))
