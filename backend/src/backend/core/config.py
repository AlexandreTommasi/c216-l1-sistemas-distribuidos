from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        extra="ignore",
    )

    database_url: str
    # Mantido como str para evitar que o pydantic-settings tente json.loads()
    # antes de qualquer validator. A lista é derivada pela property abaixo.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @field_validator("database_url")
    @classmethod
    def usar_driver_psycopg(cls, valor: str) -> str:
        # Aceita a URL "postgresql://" padrao e a direciona para o psycopg 3.
        if valor.startswith("postgresql://"):
            return valor.replace("postgresql://", "postgresql+psycopg://", 1)
        return valor


@lru_cache
def get_settings() -> Settings:
    return Settings()
