"""SQLAlchemy access to Supabase PostgreSQL.

The backend connects with the database role from SUPABASE_DB_URL, which bypasses
Row Level Security. RLS therefore protects *direct* client access (supabase-js,
Realtime); every FastAPI endpoint must enforce authorization itself.
"""
from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from app.core.config import get_settings


def normalize_db_url(url: str) -> str:
    """Accept Supabase's plain postgresql:// URI and select the psycopg3 driver."""
    for prefix in ("postgresql://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+psycopg://" + url[len(prefix):]
    return url


@lru_cache
def get_engine() -> Engine:
    """Create the engine lazily (no connection is opened until first use)."""
    url = normalize_db_url(get_settings().supabase_db_url.get_secret_value())
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
        # Required if the transaction pooler (port 6543) is used; harmless otherwise.
        connect_args={"prepare_threshold": None},
    )


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a session that is always closed."""
    session = Session(get_engine(), autoflush=False, expire_on_commit=False)
    try:
        yield session
    finally:
        session.close()
