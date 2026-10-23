import os
from typing import List, Dict, Any, Optional
import chromadb
from app.core.config import get_settings


def get_chroma_client() -> chromadb.ClientAPI:
    """Returns a persistent ChromaDB client using the directory configured in settings."""
    settings = get_settings()
    os.makedirs(settings.CHROMA_DIR, exist_ok=True)
    return chromadb.PersistentClient(path=settings.CHROMA_DIR)


def get_document_collection(client: Optional[chromadb.ClientAPI] = None):
    """Retrieves or creates the 'documents' collection configured with cosine distance."""
    if client is None:
        client = get_chroma_client()
    return client.get_or_create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"},
    )


def add_chunks(
    document_id: int,
    filename: str,
    chunks: List[Dict[str, Any]],
    user_id: Optional[int] = None,
) -> None:
    """
    Stores document chunks and their embeddings in ChromaDB.
    IDs format: doc{document_id}-chunk{chunk_index}
    """
    if not chunks:
        return
    from app.services.embeddings import embed_texts

    collection = get_document_collection()
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts)

    ids = [f"doc{document_id}-chunk{c['chunk_index']}" for c in chunks]
    metadatas = [
        {
            "user_id": int(user_id) if user_id is not None else 0,
            "document_id": document_id,
            "filename": filename,
            "page": c["page"],
            "chunk_index": c["chunk_index"],
        }
        for c in chunks
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )


def query(
    query_embedding: List[float],
    top_k: int = 5,
    document_ids: Optional[List[int]] = None,
) -> List[Dict[str, Any]]:
    """
    Searches ChromaDB for the most similar chunks.
    Filters by document_ids if provided.
    Returns: [{"document_id", "filename", "page", "text", "score"}] where score = 1 - cosine distance.
    """
    collection = get_document_collection()

    count = collection.count()
    if count == 0:
        return []

    effective_top_k = min(top_k, count)
    where_clause = None
    if document_ids:
        if len(document_ids) == 1:
            where_clause = {"document_id": document_ids[0]}
        else:
            where_clause = {"document_id": {"$in": document_ids}}

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=effective_top_k,
        where=where_clause,
        include=["documents", "metadatas", "distances"],
    )

    docs = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    hits = []
    for doc_text, meta, dist in zip(docs, metadatas, distances):
        score = 1.0 - float(dist) if dist is not None else 0.0
        hits.append({
            "document_id": int(meta["document_id"]),
            "filename": str(meta["filename"]),
            "page": int(meta["page"]),
            "text": str(doc_text),
            "score": round(score, 4),
        })

    return hits


def get_document_chunks(document_id: int) -> List[Dict[str, Any]]:
    """
    Retrieves all indexed chunks for a specific document from ChromaDB,
    returning [{"text": str, "page": int, "chunk_index": int}] sorted by chunk_index.
    """
    collection = get_document_collection()
    data = collection.get(
        where={"document_id": document_id},
        include=["documents", "metadatas"],
    )

    docs = data.get("documents") or []
    metadatas = data.get("metadatas") or []

    items = []
    for doc_text, meta in zip(docs, metadatas):
        page = int(meta.get("page", 1)) if meta else 1
        c_idx = int(meta.get("chunk_index", 0)) if meta else 0
        items.append({
            "text": str(doc_text),
            "page": page,
            "chunk_index": c_idx,
        })

    items.sort(key=lambda x: x["chunk_index"])
    return items


def delete_document(document_id: int) -> None:
    """Removes all chunks belonging to the specified document from ChromaDB."""
    collection = get_document_collection()
    collection.delete(where={"document_id": document_id})
