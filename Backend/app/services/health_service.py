"""Dependency checks behind GET /health/ready."""
import logging

import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError

logger = logging.getLogger(__name__)


def _check_database(db: Session) -> str:
    try:
        db.execute(text("SELECT 1"))
        return "ok"
    except Exception:  # noqa: BLE001 - report as unreachable, never leak details
        logger.exception("Supabase database check failed")
        return "unreachable"


def _check_supabase_api() -> str:
    """Ping Supabase Auth's health endpoint with the anon key."""
    s = get_settings()
    try:
        r = httpx.get(
            f"{s.supabase_base_url}/auth/v1/health",
            headers={"apikey": s.supabase_anon_key},
            timeout=5.0,
        )
        return "ok" if r.status_code == 200 else "unreachable"
    except httpx.HTTPError:
        logger.exception("Supabase API check failed")
        return "unreachable"


def readiness(db: Session) -> dict[str, str]:
    """Return per-dependency status; raise 503 if any dependency is down."""
    checks = {"database": _check_database(db), "supabase_api": _check_supabase_api()}
    if any(v != "ok" for v in checks.values()):
        raise AppError(
            503, "SERVICE_UNAVAILABLE", "One or more dependencies are unavailable", checks
        )
    return checks
