# API Contract Reference

Base URL: `http://localhost:8000/api`  
All responses use `application/json`. Errors always return `{"detail": "..."}` with standard HTTP status codes.

---

## 1. Health

### `GET /health`
Returns system health status.
- **Response `200 OK`**:
  ```json
  {
    "status": "ok"
  }
  ```

---

## 2. Documents

### `POST /documents/upload`
Uploads and indexes a study document into the system.
- **Request**: `multipart/form-data`
  - `file`: Binary file data (`.pdf`, `.docx`, `.txt`, `.md`). Maximum size configured by `MAX_FILE_MB` (default 20MB).
- **Response `201 Created`**:
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
- **Error Responses**:
  - `400 Bad Request`: Empty file or unsupported format.
    ```json
    {"detail": "Unsupported file type: '.exe'. Allowed types are: docx, md, pdf, txt."}
    ```
  - `413 Payload Too Large`: Exceeds maximum size.
    ```json
    {"detail": "File exceeds maximum size limit of 20MB."}
    ```

### `GET /documents`
Lists all uploaded documents, sorted newest first.
- **Response `200 OK`**:
  ```json
  {
    "documents": [
      {
        "id": 1,
        "filename": "os-notes.pdf",
        "file_type": "pdf",
        "page_count": 12,
        "chunk_count": 48,
        "status": "ready",
        "created_at": "2026-10-13T14:30:00Z"
      }
    ]
  }
  ```

### `GET /documents/{id}`
Retrieves metadata for a specific document.
- **Response `200 OK`**: Returns single `Document` object.
- **Error `404 Not Found`**:
  ```json
  {"detail": "Document with ID 42 not found."}
  ```

### `DELETE /documents/{id}`
Removes the document from the database, deletes the disk file, and removes vector embeddings from ChromaDB.
- **Response `200 OK`**:
  ```json
  {
    "message": "Document deleted"
  }
  ```
- **Error `404 Not Found`**:
  ```json
  {"detail": "Document with ID 42 not found."}
  ```

---

## 3. Chat (RAG)

### `POST /chat`
Asks a question grounded strictly in uploaded documents.
- **Request Body**:
  ```json
  {
    "question": "What is mutual exclusion?",
    "document_ids": [1],
    "session_id": null
  }
  ```
  *(Omit `document_ids` or pass `[]` to query all uploaded documents. Pass `session_id: null` to generate a new session.)*
- **Response `200 OK`**:
  ```json
  {
    "session_id": "b3f1737e-412f-4886-bd7b-f472851cf2ea",
    "answer": "Mutual exclusion ensures that only one process can hold a non-shareable resource at any given time.",
    "sources": [
      {
        "document_id": 1,
        "filename": "os-notes.pdf",
        "page": 4,
        "snippet": "Mutual exclusion means that at least one resource must be held in a non-shareable mode...",
        "score": 0.88
      }
    ]
  }
  ```
- **Unrelated / Out-of-Context Response**:
  ```json
  {
    "session_id": "b3f1737e-412f-4886-bd7b-f472851cf2ea",
    "answer": "I could not find this information in your uploaded documents.",
    "sources": []
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Empty or whitespace question.
    ```json
    {"detail": "Question cannot be empty or only whitespace."}
    ```
  - `404 Not Found`: Filter contains non-existent document IDs.
    ```json
    {"detail": "Document ID(s) not found: [99]"}
    ```
  - `422 Unprocessable Entity`: Schema validation error.
    ```json
    {"detail": "question: field required"}
    ```
  - `502 Bad Gateway`: Upstream LLM provider failure.
    ```json
    {"detail": "AI service error: Gemini API quota exceeded"}
    ```

### `GET /chat/history/{session_id}`
Retrieves previous messages and cited sources for a chat session.
- **Response `200 OK`**:
  ```json
  {
    "session_id": "b3f1737e-412f-4886-bd7b-f472851cf2ea",
    "messages": [
      {
        "role": "user",
        "content": "What is mutual exclusion?",
        "sources": null,
        "created_at": "2026-10-13T14:31:00Z"
      },
      {
        "role": "assistant",
        "content": "Mutual exclusion ensures...",
        "sources": [
          {
            "document_id": 1,
            "filename": "os-notes.pdf",
            "page": 4,
            "snippet": "...",
            "score": 0.88
          }
        ],
        "created_at": "2026-10-13T14:31:02Z"
      }
    ]
  }
  ```
- **Error `404 Not Found`**:
  ```json
  {"detail": "Session with ID 'xyz' not found."}
  ```

---

## 4. Study Tools

### `POST /study/summary`
Generates an executive study summary with Key Concepts, Definitions, and Core Takeaways in Markdown.
- **Request**:
  ```json
  {
    "document_id": 1
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "document_id": 1,
    "summary": "# Summary\n\n## Key Concepts\n- Deadlock conditions..."
  }
  ```

### `POST /study/flashcards`
Generates Q&A flashcards for active recall.
- **Request**:
  ```json
  {
    "document_id": 1,
    "count": 10
  }
  ```
  *(Count clamped between 1 and 20; defaults to 10.)*
- **Response `200 OK`**:
  ```json
  {
    "document_id": 1,
    "flashcards": [
      {
        "question": "What are the four Coffman conditions?",
        "answer": "Mutual exclusion, hold and wait, no preemption, and circular wait."
      }
    ]
  }
  ```

### `POST /study/quiz`
Generates multiple-choice quiz questions with 4 options and explanations.
- **Request**:
  ```json
  {
    "document_id": 1,
    "count": 5
  }
  ```
  *(Count clamped between 1 and 20; defaults to 5.)*
- **Response `200 OK`**:
  ```json
  {
    "document_id": 1,
    "questions": [
      {
        "question": "Which of the following is NOT a Coffman condition?",
        "options": ["Mutual exclusion", "Preemption", "Hold and wait", "Circular wait"],
        "correct_index": 1,
        "explanation": "No preemption is the condition; preemptive recovery resolves deadlocks."
      }
    ]
  }
  ```

---

## 5. Standard Error Status Reference

| Status Code | Reason | Example Detail |
|---|---|---|
| `400 Bad Request` | Invalid input or unreadable file format | `{"detail": "Uploaded file is empty."}` |
| `404 Not Found` | Target document or chat session does not exist | `{"detail": "Document with ID 10 not found."}` |
| `413 Payload Too Large` | Upload file size exceeds `MAX_FILE_MB` | `{"detail": "File exceeds maximum size limit of 20MB."}` |
| `422 Unprocessable Entity` | Pydantic schema validation failure | `{"detail": "question: field required"}` |
| `500 Internal Server Error` | Unexpected server exception | `{"detail": "Something went wrong on the server"}` |
| `502 Bad Gateway` | AI Provider API error (Gemini) | `{"detail": "AI service error: Service Unavailable"}` |
