import threading
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from app.core.config import get_settings

_model_lock = threading.Lock()
_model_instance: Optional[SentenceTransformer] = None


def get_embedding_model() -> SentenceTransformer:
    """Thread-safe lazily loads and caches the SentenceTransformer model defined in settings."""
    global _model_instance
    if _model_instance is None:
        with _model_lock:
            if _model_instance is None:
                settings = get_settings()
                _model_instance = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model_instance


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Generates normalized vector embeddings for a list of strings."""
    if not texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist()


def embed_query(text: str) -> List[float]:
    """Generates a normalized vector embedding for a single query string."""
    model = get_embedding_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()
