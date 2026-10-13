from functools import lru_cache
from typing import List
from sentence_transformers import SentenceTransformer
from app.core.config import get_settings


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """Lazily loads and caches the SentenceTransformer model defined in settings."""
    settings = get_settings()
    return SentenceTransformer(settings.EMBEDDING_MODEL)


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
