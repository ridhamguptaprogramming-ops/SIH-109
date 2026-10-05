"""Supabase API clients (Auth, and later Storage/Realtime helpers).

Two clients, deliberately separate:
- anon client: acts as an end user (e.g. password login proxy). Safe-by-design.
- admin client: uses the service-role key and bypasses RLS. BACKEND ONLY.
  Never return it, its key, or anything derived from it in an API response.
"""
from functools import lru_cache

from supabase import Client, create_client

from app.core.config import get_settings


@lru_cache
def get_supabase_client() -> Client:
    s = get_settings()
    return create_client(s.supabase_base_url, s.supabase_anon_key)


@lru_cache
def get_supabase_admin_client() -> Client:
    s = get_settings()
    return create_client(s.supabase_base_url, s.supabase_service_role_key.get_secret_value())
