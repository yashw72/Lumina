import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.database import engine, Base
import app.db.models  # noqa: F401
from app.api.routes.health import router as health_router

setup_logging()
logger = logging.getLogger("documentor.main")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure data directories exist on startup
    upload_path = Path(settings.UPLOAD_DIR)
    chroma_path = Path(settings.CHROMA_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    chroma_path.mkdir(parents=True, exist_ok=True)
    logger.info("Ensured storage directories exist: %s, %s", upload_path, chroma_path)

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
    yield


app = FastAPI(
    title="DocuMentor AI",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
