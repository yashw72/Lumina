import io
import uuid
from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import Settings, PROJECT_ROOT
from app.services import vector_store, rag, llm
from app.db.database import SessionLocal
from app.db.models import ChatSession, ChatMessage, Document, User
from tests.conftest import create_test_auth_headers


def test_get_document_chunks_ordering(tmp_path, monkeypatch):
    chroma_dir = str(tmp_path / "chroma_chunks")
    from app.core.config import get_settings
    monkeypatch.setattr(get_settings(), "CHROMA_DIR", chroma_dir)

    chunks = [
        {"text": "Chunk 2 text content here.", "page": 2, "chunk_index": 2},
        {"text": "Chunk 0 text content here.", "page": 1, "chunk_index": 0},
        {"text": "Chunk 1 text content here.", "page": 1, "chunk_index": 1},
    ]
    vector_store.add_chunks(document_id=101, filename="test.pdf", chunks=chunks)

    retrieved = vector_store.get_document_chunks(101)
    assert len(retrieved) == 3
    assert [c["chunk_index"] for c in retrieved] == [0, 1, 2]
    assert retrieved[0]["text"] == "Chunk 0 text content here."


def test_path_resolution_relative_to_root():
    s = Settings(
        DATABASE_URL="sqlite:///data/custom.db",
        UPLOAD_DIR="data/my_uploads",
        CHROMA_DIR="data/my_chroma",
    )
    expected_db_path = (PROJECT_ROOT / "data/custom.db").resolve().as_posix()
    assert s.DATABASE_URL == f"sqlite:///{expected_db_path}"
    assert Path(s.UPLOAD_DIR).is_absolute()
    assert Path(s.CHROMA_DIR).is_absolute()


def test_validation_error_returns_string_detail():
    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "val")

        # Send empty JSON payload to /api/chat (missing 'question') with valid auth
        res = client.post("/api/chat", headers=headers, json={})
        assert res.status_code == 422
        data = res.json()
        assert "detail" in data
        assert isinstance(data["detail"], str)
        assert "question" in data["detail"]


def test_file_too_large_returns_413(monkeypatch):
    from app.core.config import get_settings
    monkeypatch.setattr(get_settings(), "MAX_FILE_MB", 1)

    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "bigfile")

        oversized = b"A" * (2 * 1024 * 1024)  # 2MB > 1MB
        res = client.post(
            "/api/documents/upload",
            headers=headers,
            files={"file": ("big.txt", io.BytesIO(oversized), "text/plain")},
        )
        assert res.status_code == 413
        assert isinstance(res.json()["detail"], str)
        assert "exceeds" in res.json()["detail"]


def test_follow_up_question_enrichment(monkeypatch):
    sid = f"followup-{uuid.uuid4().hex[:8]}"
    db = SessionLocal()
    # Create test user and document
    user = User(name="Followup User", email=f"fu_{uuid.uuid4().hex[:8]}@test.com", password_hash="hash")
    db.add(user)
    db.commit()
    db.refresh(user)

    doc = Document(user_id=user.id, filename="deadlock.pdf", file_type="pdf", stored_path="dummy.pdf", status="ready")
    db.add(doc)
    session = ChatSession(id=sid, user_id=user.id)
    db.add(session)
    user_msg_1 = ChatMessage(session_id=sid, role="user", content="What is deadlock?")
    asst_msg_1 = ChatMessage(session_id=sid, role="assistant", content="Deadlock is ...")
    db.add(user_msg_1)
    db.add(asst_msg_1)
    db.commit()

    captured_query = []

    def mock_query(query_embedding, top_k, document_ids):
        return []

    def mock_embed(text):
        captured_query.append(text)
        return [0.1] * 384

    monkeypatch.setattr(vector_store, "query", mock_query)
    monkeypatch.setattr(rag.embeddings, "embed_query", mock_embed)

    rag.answer_question(
        db=db,
        question="how does it happen?",  # 4 words < 6 words
        document_ids=None,
        session_id=sid,
        user_id=user.id,
    )
    db.close()

    assert len(captured_query) == 1
    # Check that previous query was prepended
    assert "What is deadlock? how does it happen?" in captured_query[0]
