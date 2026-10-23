from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal
from app.db.models import Document
from app.services import study_tools, llm
from tests.conftest import create_test_auth_headers


def test_flashcards_and_quiz_validation(monkeypatch):
    # Mock get_document_text
    monkeypatch.setattr(study_tools, "get_document_text", lambda doc_id: "Sample text about Operating Systems.")

    # 1. Flashcards validation
    mock_flashcards_raw = [
        {"question": "What is a process?", "answer": "A program in execution."},
        {"invalid": "no question or answer"},
        {"question": "", "answer": "Empty question"},
        {"question": "What is IPC?", "answer": "Inter-process communication."},
    ]
    monkeypatch.setattr(llm, "generate_json", lambda *args, **kwargs: mock_flashcards_raw)

    cards = study_tools.generate_flashcards(document_id=1, count=5)
    assert len(cards) == 2
    assert cards[0]["question"] == "What is a process?"
    assert cards[1]["question"] == "What is IPC?"

    # 2. Quiz validation
    mock_quiz_raw = [
        {
            "question": "Which scheduling algorithm is preemptive?",
            "options": ["Round Robin", "FCFS", "SJF Non-preemptive", "Priority Non-preemptive"],
            "correct_index": 0,
            "explanation": "Round Robin uses time slices and is preemptive.",
        },
        {
            "question": "Invalid options count",
            "options": ["A", "B", "C"],  # Only 3 options
            "correct_index": 0,
            "explanation": "Invalid",
        },
        {
            "question": "Invalid correct index",
            "options": ["A", "B", "C", "D"],
            "correct_index": 5,  # Out of range
            "explanation": "Invalid",
        },
    ]
    monkeypatch.setattr(llm, "generate_json", lambda *args, **kwargs: mock_quiz_raw)

    quiz = study_tools.generate_quiz(document_id=1, count=5)
    assert len(quiz) == 1
    assert quiz[0]["question"] == "Which scheduling algorithm is preemptive?"
    assert quiz[0]["correct_index"] == 0


def test_study_api_endpoints(monkeypatch):
    monkeypatch.setattr(study_tools, "get_document_text", lambda did: "Study notes content.")
    monkeypatch.setattr(llm, "generate", lambda *args, **kwargs: "# Summary\n- Key concepts")
    monkeypatch.setattr(
        llm,
        "generate_json",
        lambda *args, **kwargs: [{"question": "Q1", "answer": "A1"}],
    )

    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "study")

        # Create a ready document in DB owned by this user
        db = SessionLocal()
        doc = Document(
            user_id=user_id,
            filename="notes.txt",
            file_type="txt",
            stored_path="dummy.txt",
            page_count=1,
            chunk_count=1,
            status="ready",
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        doc_id = doc.id
        db.close()

        try:
            # Summary
            res = client.post("/api/study/summary", headers=headers, json={"document_id": doc_id})
            assert res.status_code == 200
            assert "# Summary" in res.json()["summary"]

            # Flashcards
            res = client.post("/api/study/flashcards", headers=headers, json={"document_id": doc_id, "count": 2})
            assert res.status_code == 200
            assert len(res.json()["flashcards"]) == 1

            # 404 for missing document
            res_404 = client.post("/api/study/summary", headers=headers, json={"document_id": 99999})
            assert res_404.status_code == 404
        finally:
            db = SessionLocal()
            d = db.query(Document).filter(Document.id == doc_id).first()
            if d:
                db.delete(d)
                db.commit()
            db.close()
