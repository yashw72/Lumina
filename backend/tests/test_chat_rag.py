from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Document
from app.services import vector_store, llm
from tests.conftest import create_test_auth_headers


def test_chat_no_relevant_chunks(monkeypatch):
    # Mock vector_store.query to return empty list
    monkeypatch.setattr(vector_store, "query", lambda *args, **kwargs: [])

    # Mock llm.generate to ensure it is NOT called
    def fail_if_called(*args, **kwargs):
        raise AssertionError("LLM should not be called when no relevant chunks are found!")

    monkeypatch.setattr(llm, "generate", fail_if_called)

    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "norelevant")

        # Create a ready document so the user has documents to query
        db = SessionLocal()
        doc = Document(
            user_id=user_id,
            filename="notes.pdf",
            file_type="pdf",
            stored_path="dummy_path.pdf",
            status="ready",
        )
        db.add(doc)
        db.commit()
        db.close()

        response = client.post(
            "/api/chat",
            headers=headers,
            json={"question": "What is quantum computing?", "session_id": None},
        )
        assert response.status_code == 200
        data = response.json()
        assert "could not find this information" in data["answer"].lower()
        assert data["sources"] == []
        assert data["session_id"] is not None

        session_id = data["session_id"]

        # Check history
        hist_res = client.get(f"/api/chat/history/{session_id}", headers=headers)
        assert hist_res.status_code == 200
        messages = hist_res.json()["messages"]
        assert len(messages) == 2
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"


def test_chat_with_relevant_chunks(monkeypatch):
    mock_chunks = [
        {
            "document_id": 1,
            "filename": "os.pdf",
            "page": 3,
            "text": "Deadlock is a state where a set of processes are blocked because each process is holding a resource and waiting for another.",
            "score": 0.88,
        }
    ]
    monkeypatch.setattr(vector_store, "query", lambda *args, **kwargs: mock_chunks)
    monkeypatch.setattr(
        llm,
        "generate",
        lambda *args, **kwargs: "A deadlock occurs when processes are waiting on each other's resources indefinitely.",
    )

    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "relevant")

        # Create a ready document in DB matching document_id 1 or created ID
        db = SessionLocal()
        doc = Document(
            id=1,
            user_id=user_id,
            filename="os.pdf",
            file_type="pdf",
            stored_path="dummy_os.pdf",
            status="ready",
        )
        db.merge(doc)
        db.commit()
        db.close()

        response = client.post(
            "/api/chat",
            headers=headers,
            json={"question": "What is deadlock?", "session_id": "test-session-123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == "test-session-123"
        assert "deadlock" in data["answer"].lower()
        assert len(data["sources"]) == 1
        assert data["sources"][0]["document_id"] == 1
        assert data["sources"][0]["page"] == 3
        assert data["sources"][0]["score"] == 0.88


def test_chat_incomplete_prompt_handling(monkeypatch):
    """Verifies that vague/incomplete prompts like 'Explain' or incomplete diagram prompts prompt for details without hallucinating."""
    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "incomplete")

        # 1. Bare "Explain"
        response = client.post(
            "/api/chat",
            headers=headers,
            json={"question": "Explain", "session_id": None},
        )
        assert response.status_code == 200
        data = response.json()
        assert "please specify what concept or topic" in data["answer"].lower()
        assert data["sources"] == []
        assert data["image_url"] is None

        # 2. Incomplete diagram prompt prefix
        response2 = client.post(
            "/api/chat",
            headers=headers,
            json={"question": "Draw a clear educational diagram illustrating", "session_id": None},
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert "please specify what concept or topic" in data2["answer"].lower()
        assert data2["image_url"] is None
