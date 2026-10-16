from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[0]


class Settings(BaseSettings):
    app_name: str = "DarkStore API"
    debug: bool = False

    database_url: str

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    static_dir: Path = BASE_DIR / "static"
    images_dir: Path = BASE_DIR / "static" / "images"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

settings.images_dir.mkdir(parents=True, exist_ok=True)
