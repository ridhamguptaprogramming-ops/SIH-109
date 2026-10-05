# MastiGuard Backend

AI + IoT early forecasting of bovine mastitis. FastAPI backend on **Supabase** (PostgreSQL, Auth, Realtime, RLS).

> Risk scores are **decision-support indicators from a prototype model, not a clinical diagnosis.**

Design, schema, RLS model and API contract: [`docs/DESIGN.md`](docs/DESIGN.md).
**Status:** Phase 1 (FastAPI + Supabase connection + health checks). Later sections are filled in per phase.

## 1. Supabase setup

1. Create a project at https://supabase.com.
2. SQL Editor → run, in order:
   `supabase/migrations/20261005000000_init_schema.sql`, then `supabase/migrations/20261005000100_rls_policies.sql`.
   (Or use the Supabase CLI: `supabase link` then `supabase db push`.)
3. Collect values for `.env`:
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API Keys.
   - `SUPABASE_DB_URL`: Dashboard → Connect → **Session pooler** URI (port 5432).
4. Never put the service-role key anywhere except this backend's `.env`.

## 2. Run

```bash
cp .env.example .env      # fill in the values
```

Docker (backend only; the database is Supabase):
```bash
docker compose up --build
```
Without Docker:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- `GET /health`: liveness (no external calls)
- `GET /health/ready`: verifies Supabase PostgreSQL + Supabase API are reachable
- Swagger UI: http://localhost:8000/docs

## 3. Environment variables

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | Publishable key (login proxy) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Backend only**, bypasses RLS |
| `SUPABASE_DB_URL` | Postgres URI (session pooler) |
| `SECRET_KEY` | HMAC pepper for hashing device API keys |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `SUPABASE_JWT_SECRET` | Optional, legacy HS256 projects only |

## 4. Tests

```bash
pytest
```
