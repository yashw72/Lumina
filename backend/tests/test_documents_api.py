import io
from fastapi.testclient import TestClient
from app.core.config import get_settings
from app.main import app
from tests.conftest import create_test_auth_headers


def test_documents_crud_api(tmp_path, monkeypatch):
    settings = get_settings()
    upload_dir = str(tmp_path / "uploads")
    chroma_dir = str(tmp_path / "chroma")
    monkeypatch.setattr(settings, "UPLOAD_DIR", upload_dir)
    monkeypatch.setattr(settings, "CHROMA_DIR", chroma_dir)

    with TestClient(app) as client:
        user_id, headers = create_test_auth_headers(client, "doc")

        # 1. Upload a text document
        file_content = (
            b"Introduction to Computer Science.\n\n"
            b"Data structures organize data in memory efficiently.\n"
            b"Algorithms solve specific computational problems step by step."
        )
        response = client.post(
            "/api/documents/upload",
            headers=headers,
            files={"file": ("intro.txt", io.BytesIO(file_content), "text/plain")},
        )
        assert response.status_code == 201, response.text
        doc_data = response.json()
        assert doc_data["filename"] == "intro.txt"
        assert doc_data["file_type"] == "txt"
        assert doc_data["status"] == "ready"
        doc_id = doc_data["id"]

        # 2. List documents
        list_res = client.get("/api/documents", headers=headers)
        assert list_res.status_code == 200
        docs = list_res.json()["documents"]
        assert any(d["id"] == doc_id for d in docs)

        # 3. Get single document
        get_res = client.get(f"/api/documents/{doc_id}", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["id"] == doc_id

        # 4. Delete document
        del_res = client.delete(f"/api/documents/{doc_id}", headers=headers)
        assert del_res.status_code == 200
        assert del_res.json() == {"message": "Document deleted"}

        # 5. Verify 404 after deletion
        get_after_del = client.get(f"/api/documents/{doc_id}", headers=headers)
        assert get_after_del.status_code == 404
