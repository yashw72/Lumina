from functools import lru_cache
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Project root contains backend/ and data/
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-3.1-flash-lite"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    DATABASE_URL: str = "sqlite:///data/documentor.db"
    UPLOAD_DIR: str = "data/uploads"
    CHROMA_DIR: str = "data/chroma"
    MAX_FILE_MB: int = 20
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    TOP_K: int = 5
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str):
            if value.startswith("[") and value.endswith("]"):
                import json
                try:
                    parsed = json.loads(value)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except Exception:
                    pass
            origins = [origin.strip() for origin in value.split(",") if origin.strip()]
            return origins if origins else ["http://localhost:5173", "http://127.0.0.1:5173"]
        elif isinstance(value, (list, tuple, set)):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def resolve_database_url(cls, value: str) -> str:
        if value.startswith("sqlite:///"):
            path_part = value[len("sqlite:///"):]
            if path_part and path_part != ":memory:":
                p = Path(path_part)
                if not p.is_absolute():
                    if path_part.startswith(".."):
                        resolved_path = (BACKEND_DIR / p).resolve()
                    else:
                        resolved_path = (PROJECT_ROOT / p).resolve()
                    return f"sqlite:///{resolved_path.as_posix()}"
        return value

    @field_validator("UPLOAD_DIR", "CHROMA_DIR", mode="after")
    @classmethod
    def resolve_paths(cls, value: str) -> str:
        p = Path(value)
        if not p.is_absolute():
            if str(value).startswith(".."):
                resolved_path = (BACKEND_DIR / p).resolve()
            else:
                resolved_path = (PROJECT_ROOT / p).resolve()
            return str(resolved_path)
        return value

    model_config = SettingsConfigDict(
        env_file=[str(BACKEND_DIR / ".env"), str(PROJECT_ROOT / ".env"), ".env"],
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
