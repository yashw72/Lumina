import logging
import threading
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.database import engine, Base
import app.db.models  # noqa: F401
from app.services.llm import LLMError
from app.services.embeddings import get_embedding_model
from app.api.routes.health import router as health_router
from app.api.routes.documents import router as documents_router
from app.api.routes.chat import router as chat_router
from app.api.routes.study import router as study_router

setup_logging()
logger = logging.getLogger("documentor.main")
settings = get_settings()


def _warmup_embedding_model():
    """Preloads the embedding model in a background thread to prevent first-request lag."""
    try:
        get_embedding_model()
        logger.info("Embedding model ready")
    except Exception as e:
        logger.warning("Embedding model warm-up encountered an error: %s", str(e))


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

    # Warm up embedding model in background thread
    threading.Thread(target=_warmup_embedding_model, daemon=True).start()

    yield


app = FastAPI(
    title="DocuMentor AI",
    lifespan=lifespan,
)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats validation errors into a single readable string sentence."""
    errors = exc.errors()
    if errors:
        first = errors[0]
        loc = [str(part) for part in first.get("loc", []) if str(part) != "body"]
        field_name = ".".join(loc) if loc else "field"
        msg = first.get("msg", "Invalid parameter")
        detail = f"{field_name}: {msg}"
    else:
        detail = "Validation error"

    return JSONResponse(
        status_code=422,
        content={"detail": detail},
    )


@app.exception_handler(LLMError)
async def llm_exception_handler(request: Request, exc: LLMError):
    logger.error("LLMError encountered on %s %s: %s", request.method, request.url.path, exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": f"AI service error: {exc.message}"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catches unexpected server errors.
    Explicitly adds CORS headers since Starlette handles unhandled exceptions outside CORSMiddleware.
    """
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, str(exc), exc_info=True)
    headers = {}
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"

    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong on the server"},
        headers=headers,
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
