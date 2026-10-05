import os

# Must be set before the app (and its settings) are imported.
os.environ.update(
    SUPABASE_URL="https://example.supabase.co",
    SUPABASE_ANON_KEY="test-anon-key",
    SUPABASE_SERVICE_ROLE_KEY="test-service-role-key-MUST-NOT-LEAK",
    SUPABASE_DB_URL="postgresql://user:pass@localhost:5432/postgres",
    SECRET_KEY="test-secret-key-not-for-production",
    CORS_ORIGINS="http://localhost:5173",
)

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.main import app


@pytest.fixture()
def client():
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture()
def fake_db():
    """Install a fake DB session; returns a holder whose .fail flag simulates an outage."""

    class _DB:
        fail = False

        def execute(self, *_a, **_k):
            if self.fail:
                raise RuntimeError("db down")

        def close(self):
            pass

    db = _DB()
    app.dependency_overrides[get_db] = lambda: db
    return db
