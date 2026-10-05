"""Application settings, loaded from environment variables / .env.

Nothing is hardcoded. Secret values use SecretStr so they never appear in
logs or repr() output; call .get_secret_value() only where truly needed.
"""
from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "MastiGuard Backend"
    app_version: str = "1.0.0"
    environment: str = "development"

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: SecretStr  # BACKEND ONLY
    supabase_db_url: SecretStr
    supabase_jwt_secret: SecretStr = SecretStr("")  # legacy HS256 projects only

    secret_key: SecretStr

    # Comma-separated list, e.g. "http://localhost:5173,http://localhost:3000"
    cors_origins: str = "http://localhost:5173"

    @property
    def supabase_base_url(self) -> str:
        return self.supabase_url.rstrip("/")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
