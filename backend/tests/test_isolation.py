import io
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.config import get_settings
from app.db.database import Base, get_db
from app.db.models import Document, ChatSession, ChatMessage
from app.services import llm, study_tools, vector_store


@pytest.fixture
def isolation_env(tmp_path, monkeypatch):
    """Sets up an isolated SQLite database and storage directories for isolation testing."""
    settings = get_settings()
    test_db_file = tmp_path / "test_isolation.db"
    test_db_url = f"sqlite:///{test_db_file.as_posix()}"
    test_upload_dir = str(tmp_path / "uploads")
    test_chroma_dir = str(tmp_path / "chroma")

    monkeypatch.setattr(settings, "DATABASE_URL", test_db_url)
    monkeypatch.setattr(settings, "UPLOAD_DIR", test_upload_dir)
    monkeypatch.setattr(settings, "CHROMA_DIR", test_chroma_dir)

    test_engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield TestingSessionLocal

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


def test_public_health_and_protected_routes_unauthenticated():
    """Confirms /api/health is public, and all data routes require authentication (401)."""
    with TestClient(app) as client:
        # Health is public
        health_res = client.get("/api/health")
        assert health_res.status_code == 200
        assert health_res.json() == {"status": "ok"}

        # Protected routes must return 401 when no token is supplied
        protected_calls = [
            ("POST", "/api/documents/upload", {"files": {"file": ("test.txt", b"abc", "text/plain")}}),
            ("GET", "/api/documents", {}),
            ("GET", "/api/documents/1", {}),
            ("DELETE", "/api/documents/1", {}),
            ("POST", "/api/chat", {"json": {"question": "Hello"}}),
            ("POST", "/api/chat/image", {"json": {"prompt": "Draw diagram"}}),
            ("GET", "/api/chat/history/test-session-id", {}),
            ("POST", "/api/study/summary", {"json": {"document_id": 1}}),
            ("POST", "/api/study/flashcards", {"json": {"document_id": 1}}),
            ("POST", "/api/study/quiz", {"json": {"document_id": 1}}),
        ]

        for method, path, kwargs in protected_calls:
            if method == "GET":
                res = client.get(path, **kwargs)
            elif method == "POST":
                res = client.post(path, **kwargs)
            elif method == "DELETE":
                res = client.delete(path, **kwargs)
            assert res.status_code == 401, f"Route {method} {path} should require auth but returned {res.status_code}"
            assert res.json()["detail"] == "Not authenticated"
            assert "WWW-Authenticate" in res.headers


def test_multi_user_data_isolation(isolation_env, monkeypatch):
    """
    User A uploads data and creates sessions.
    Verifies User B cannot list, read, delete, chat with, study from,
    or view sources from User A's data.
    """
    SessionLocal = isolation_env

    # Mock LLM generation for chat and study
    monkeypatch.setattr(llm, "generate", lambda *args, **kwargs: "Mocked assistant answer")
    monkeypatch.setattr(llm, "generate_json", lambda *args, **kwargs: [{"question": "Q?", "answer": "A"}])

    with TestClient(app) as client:
        # 1. Sign up User A
        res_a = client.post(
            "/api/auth/signup",
            json={"name": "User Alpha", "email": "alpha@test.com", "password": "Password123"},
        )
        assert res_a.status_code == 201
        token_a = res_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Sign up User B
        res_b = client.post(
            "/api/auth/signup",
            json={"name": "User Beta", "email": "beta@test.com", "password": "Password123"},
        )
        assert res_b.status_code == 201
        token_b = res_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. User A uploads a document
        doc_content = b"User A confidential research on Operating Systems and concurrency control."
        upload_res = client.post(
            "/api/documents/upload",
            headers=headers_a,
            files={"file": ("alpha_notes.txt", io.BytesIO(doc_content), "text/plain")},
        )
        assert upload_res.status_code == 201
        doc_a_id = upload_res.json()["id"]

        # 4. User B lists documents -> Must be empty!
        list_b = client.get("/api/documents", headers=headers_b)
        assert list_b.status_code == 200
        assert len(list_b.json()["documents"]) == 0

        # 5. User B tries to get User A's document -> 404
        get_b = client.get(f"/api/documents/{doc_a_id}", headers=headers_b)
        assert get_b.status_code == 404

        # 6. User B tries to delete User A's document -> 404
        del_b = client.delete(f"/api/documents/{doc_a_id}", headers=headers_b)
        assert del_b.status_code == 404

        # 7. User B tries to study from User A's document -> 404
        sum_b = client.post("/api/study/summary", headers=headers_b, json={"document_id": doc_a_id})
        assert sum_b.status_code == 404

        fc_b = client.post("/api/study/flashcards", headers=headers_b, json={"document_id": doc_a_id, "count": 5})
        assert fc_b.status_code == 404

        quiz_b = client.post("/api/study/quiz", headers=headers_b, json={"document_id": doc_a_id, "count": 5})
        assert quiz_b.status_code == 404

        # 8. User B tries to chat explicitly specifying User A's document_id -> 404
        chat_explicit_b = client.post(
            "/api/chat",
            headers=headers_b,
            json={"question": "What is in alpha notes?", "document_ids": [doc_a_id]},
        )
        assert chat_explicit_b.status_code == 404

        # 9. User B chats with no document_ids -> User B has no documents uploaded, gets friendly fallback
        chat_all_b = client.post(
            "/api/chat",
            headers=headers_b,
            json={"question": "What is in alpha notes?"},
        )
        assert chat_all_b.status_code == 200
        data_all_b = chat_all_b.json()
        assert "Upload a document first" in data_all_b["answer"]
        assert data_all_b["sources"] == []

        # 10. User A chats, creating session_a
        chat_a = client.post(
            "/api/chat",
            headers=headers_a,
            json={"question": "Explain concurrency control", "document_ids": [doc_a_id]},
        )
        assert chat_a.status_code == 200
        session_a_id = chat_a.json()["session_id"]

        # 11. User B tries to read User A's chat session history -> 404
        hist_b = client.get(f"/api/chat/history/{session_a_id}", headers=headers_b)
        assert hist_b.status_code == 404

        # 12. User B tries to continue User A's chat session -> 404
        cont_b = client.post(
            "/api/chat",
            headers=headers_b,
            json={"question": "Tell me more", "session_id": session_a_id},
        )
        assert cont_b.status_code == 404
