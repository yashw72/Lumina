import io
from fastapi.testclient import TestClient
from app.core.config import get_settings
from app.main import app
from app.services import llm


def test_end_to_end_workflow(tmp_path, monkeypatch):
    settings = get_settings()
    upload_dir = str(tmp_path / "uploads_e2e")
    chroma_dir = str(tmp_path / "chroma_e2e")
    monkeypatch.setattr(settings, "UPLOAD_DIR", upload_dir)
    monkeypatch.setattr(settings, "CHROMA_DIR", chroma_dir)

    # Mock LLM generation
    monkeypatch.setattr(
        llm,
        "generate",
        lambda *args, **kwargs: "Concurrency allows multiple calculations to happen simultaneously.",
    )

    with TestClient(app) as client:
        # Step 1: Health Check
        health = client.get("/api/health")
        assert health.status_code == 200

        # Step 2: Upload Document
        content = (
            b"Concurrency and Multithreading in Modern Systems.\n\n"
            b"Concurrency allows multiple computations to execute during overlapping time periods.\n"
            b"Locks, semaphores, and monitors are synchronization primitives used to avoid race conditions."
        )
        upload_res = client.post(
            "/api/documents/upload",
            files={"file": ("concurrency.txt", io.BytesIO(content), "text/plain")},
        )
        assert upload_res.status_code == 201, upload_res.text
        doc = upload_res.json()
        doc_id = doc["id"]
        assert doc["status"] == "ready"

        # Step 3: Chat with the uploaded document
        chat_res = client.post(
            "/api/chat",
            json={
                "question": "What does concurrency allow in modern systems?",
                "document_ids": [doc_id],
                "session_id": None,
            },
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["session_id"] is not None
        assert "concurrency" in chat_data["answer"].lower()
        assert len(chat_data["sources"]) > 0
        assert chat_data["sources"][0]["document_id"] == doc_id

        # Step 4: Verify chat history
        session_id = chat_data["session_id"]
        hist_res = client.get(f"/api/chat/history/{session_id}")
        assert hist_res.status_code == 200
        assert len(hist_res.json()["messages"]) == 2

        # Step 5: Delete Document
        del_res = client.delete(f"/api/documents/{doc_id}")
        assert del_res.status_code == 200

        # Step 6: Post-deletion check: Chat still functions and does not crash
        post_del_chat = client.post(
            "/api/chat",
            json={
                "question": "Tell me about concurrency",
                "session_id": session_id,
            },
        )
        assert post_del_chat.status_code == 200
