import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.database import engine, Base
import app.db.models  # noqa: F401
from app.services.llm import LLMError
from app.api.routes.health import router as health_router
from app.api.routes.documents import router as documents_router
from app.api.routes.chat import router as chat_router
from app.api.routes.study import router as study_router

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

# Global Exception Handlers
@app.exception_handler(LLMError)
async def llm_exception_handler(request: Request, exc: LLMError):
    logger.error("LLMError encountered on %s %s: %s", request.method, request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": f"AI service error: {exc.message}"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )


# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(study_router, prefix="/api")
