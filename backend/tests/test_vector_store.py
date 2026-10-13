import pytest
from app.core.config import get_settings
from app.services.embeddings import embed_query
from app.services import vector_store


def test_vector_store_add_query_delete(tmp_path, monkeypatch):
    chroma_dir = str(tmp_path / "chroma_test")
    settings = get_settings()
    monkeypatch.setattr(settings, "CHROMA_DIR", chroma_dir)

    chunks_doc1 = [
        {"text": "Python is a popular interpreted high-level general-purpose programming language.", "page": 1, "chunk_index": 0},
        {"text": "FastAPI is a modern, fast web framework for building APIs with Python.", "page": 2, "chunk_index": 1},
    ]

    chunks_doc2 = [
        {"text": "ChromaDB is the AI-native open-source embedding database.", "page": 1, "chunk_index": 0},
    ]

    # Add chunks
    vector_store.add_chunks(document_id=1, filename="python.txt", chunks=chunks_doc1)
    vector_store.add_chunks(document_id=2, filename="chroma.txt", chunks=chunks_doc2)

    # Query for Python
    q_emb = embed_query("What is FastAPI?")
    results = vector_store.query(q_emb, top_k=2)
    assert len(results) > 0
    # Top result should mention FastAPI
    assert "FastAPI" in results[0]["text"]
    assert results[0]["document_id"] == 1
    assert "score" in results[0]

    # Query with document_ids filter
    results_filtered = vector_store.query(q_emb, top_k=2, document_ids=[2])
    assert len(results_filtered) == 1
    assert results_filtered[0]["document_id"] == 2
    assert "ChromaDB" in results_filtered[0]["text"]

    # Delete document 1
    vector_store.delete_document(document_id=1)
    results_after_delete = vector_store.query(q_emb, top_k=5, document_ids=[1])
    assert len(results_after_delete) == 0
