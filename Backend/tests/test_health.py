from app.core.config import get_settings
from app.core.database import normalize_db_url
from app.services import health_service


def test_health_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "service": "MastiGuard Backend", "version": "1.0.0"}


def test_readiness_ok(client, fake_db, monkeypatch):
    monkeypatch.setattr(health_service, "_check_supabase_api", lambda: "ok")
    r = client.get("/health/ready")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "checks": {"database": "ok", "supabase_api": "ok"}}


def test_readiness_db_down_returns_503_envelope(client, fake_db, monkeypatch):
    monkeypatch.setattr(health_service, "_check_supabase_api", lambda: "ok")
    fake_db.fail = True
    r = client.get("/health/ready")
    assert r.status_code == 503
    body = r.json()
    assert body["success"] is False
    assert body["error"]["code"] == "SERVICE_UNAVAILABLE"
    assert body["error"]["details"]["database"] == "unreachable"


def test_readiness_supabase_api_down(client, fake_db, monkeypatch):
    monkeypatch.setattr(health_service, "_check_supabase_api", lambda: "unreachable")
    r = client.get("/health/ready")
    assert r.status_code == 503
    assert r.json()["error"]["details"]["supabase_api"] == "unreachable"


def test_unknown_route_uses_error_envelope(client):
    r = client.get("/api/does-not-exist")
    assert r.status_code == 404
    assert r.json()["error"]["code"] == "NOT_FOUND"


def test_cors_allows_configured_origin_only(client):
    ok = client.get("/health", headers={"Origin": "http://localhost:5173"})
    bad = client.get("/health", headers={"Origin": "http://evil.example"})
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert "access-control-allow-origin" not in bad.headers


def test_db_url_is_normalized_for_psycopg3():
    assert normalize_db_url("postgresql://u:p@h:5432/db") == "postgresql+psycopg://u:p@h:5432/db"
    assert normalize_db_url("postgres://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert normalize_db_url("postgresql+psycopg://u:p@h/db") == "postgresql+psycopg://u:p@h/db"


def test_service_role_key_never_exposed(client):
    secret = "test-service-role-key-MUST-NOT-LEAK"
    assert secret not in repr(get_settings())
    assert secret not in client.get("/health").text
    assert secret not in client.get("/openapi.json").text
