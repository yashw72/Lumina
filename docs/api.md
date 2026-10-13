# API Contract

> **Note:** Both backend and frontend developers MUST follow this specification exactly.

Base URL: `http://localhost:8000/api`. All responses are JSON. Errors use `{"detail": "message"}` with a proper HTTP status code.

---

## Health
`GET /health` -> `{"status": "ok"}`

---

## Documents
- `POST /documents/upload` — `multipart/form-data`, field `file`. Allowed extensions: `.pdf`, `.docx`, `.txt`, `.md`, max `MAX_FILE_MB`.
  Response `201`:
  ```json
  {
    "id": 1,
    "filename": "os-notes.pdf",
    "file_type": "pdf",
    "page_count": 12,
    "chunk_count": 48,
    "status": "ready",
    "created_at": "2026-10-13T14:30:00Z"
  }
  ```
- `GET /documents` -> `{"documents": [ <Document>, ... ]}`
- `GET /documents/{id}` -> `<Document>`
- `DELETE /documents/{id}` -> `{"message": "Document deleted"}` (also removes its vectors and file)

---

## Chat
- `POST /chat`
  Request:
  ```json
  {
    "question": "What is deadlock?",
    "document_ids": [1, 2],
    "session_id": null
  }
  ```
  (`document_ids` empty or omitted = search all documents; `session_id` null = create a new session)

  Response:
  ```json
  {
    "session_id": "b3f1...",
    "answer": "Deadlock is ...",
    "sources": [
      {
        "document_id": 1,
        "filename": "os-notes.pdf",
        "page": 4,
        "snippet": "A deadlock occurs when ...",
        "score": 0.82
      }
    ]
  }
  ```
  *If nothing relevant is found, the answer must say the documents do not contain that information (no hallucination) and `sources` is `[]`.*

- `GET /chat/history/{session_id}` ->
  ```json
  {
    "session_id": "...",
    "messages": [
      {
        "role": "user|assistant",
        "content": "...",
        "sources": [...],
        "created_at": "..."
      }
    ]
  }
  ```

---

## Study Tools
- `POST /study/summary` — `{"document_id": 1}`
  Response:
  ```json
  {
    "document_id": 1,
    "summary": "markdown text"
  }
  ```

- `POST /study/flashcards` — `{"document_id": 1, "count": 10}`
  Response:
  ```json
  {
    "document_id": 1,
    "flashcards": [
      {
        "question": "...",
        "answer": "..."
      }
    ]
  }
  ```

- `POST /study/quiz` — `{"document_id": 1, "count": 5}`
  Response:
  ```json
  {
    "document_id": 1,
    "questions": [
      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "correct_index": 2,
        "explanation": "..."
      }
    ]
  }
  ```
