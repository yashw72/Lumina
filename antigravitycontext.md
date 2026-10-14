# antigravitycontext.md — DocuMentor AI

> Read this file FIRST before doing any task in this repository. It is the single source of truth for what we are building, how it is structured, and the rules we follow.

---

## 1. Project Summary

**DocuMentor AI** is a RAG-powered (Retrieval-Augmented Generation) learning assistant. A student uploads study material (PDF, DOCX, TXT, MD). The system splits it into chunks, converts the chunks into embeddings, stores them in a vector database, and then lets the student:

1. **Chat with their documents** – ask questions and get answers grounded ONLY in the uploaded material, with source citations (file name, page, snippet).
2. **Generate study aids** – summaries, flashcards and multiple-choice quizzes per document.

### Why RAG?
A plain LLM may hallucinate or not know the student's material. RAG retrieves the most relevant chunks first and gives them to the LLM as context, so answers are accurate and traceable to the source.

### RAG Flow
```
UPLOAD:  file -> extract text (per page) -> clean -> chunk -> embed -> store in ChromaDB (+ metadata in SQLite)
ASK:     question -> embed -> top-K similar chunks from ChromaDB -> build prompt (context + question) -> LLM -> answer + sources
```

---

## 2. Team and Ownership

| Person | Area | Works in |
|---|---|---|
| **Yash** | Backend, RAG pipeline, vector DB, LLM, study tools, tests | `backend/` |
| **Kaustubh** | Frontend UI, API integration, UX, polish | `frontend/` |

Rules: Yash does not edit `frontend/`. Kaustubh does not edit `backend/`. Shared files (`README.md`, `docs/`, `antigravitycontext.md`) are edited through a Pull Request reviewed by the other person.

---

## 3. Tech Stack

### Backend
- Python 3.11+
- **FastAPI** + Uvicorn (REST API)
- **SQLite + SQLAlchemy** (document metadata, chat history)
- **ChromaDB** (persistent local vector store)
- **sentence-transformers** `all-MiniLM-L6-v2` (free, local embeddings)
- **Google Gemini API** via `google-genai` SDK (LLM). Model name comes from env `LLM_MODEL`. LLM access is wrapped in `services/llm.py` so the provider can be swapped.
- `pypdf` (PDF), `python-docx` (DOCX)
- `pydantic-settings` (config), `pytest` (tests)

### Frontend
- **React 18 + Vite** (JavaScript)
- **Tailwind CSS**
- `react-router-dom`, `axios`, `react-hot-toast`, `lucide-react`, `react-markdown`
- `framer-motion`, `@fontsource-variable/plus-jakarta-sans`

### Tooling
- Git + GitHub (feature branches + PRs), Conventional Commits
- Optional: Docker / docker-compose

---

## 4. Folder Structure (do NOT invent new top-level folders)

```
documentor-ai/
├── antigravitycontext.md
├── README.md
├── .gitignore
├── docker-compose.yml            # optional, last step
├── docs/
│   ├── architecture.md           # RAG flow + diagram
│   └── api.md                    # API contract copy
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, router registration
│   │   ├── core/
│   │   │   ├── config.py         # Settings from env
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── database.py       # engine, SessionLocal, Base, get_db
│   │   │   └── models.py         # Document, ChatSession, ChatMessage
│   │   ├── schemas/              # Pydantic request/response models
│   │   │   ├── document.py
│   │   │   ├── chat.py
│   │   │   └── study.py
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       ├── documents.py
│   │   │       ├── chat.py
│   │   │       └── study.py
│   │   └── services/
│   │       ├── loaders.py        # PDF/DOCX/TXT/MD -> list of {page, text}
│   │       ├── chunker.py        # text -> chunks with metadata
│   │       ├── embeddings.py     # sentence-transformers wrapper
│   │       ├── vector_store.py   # ChromaDB add/query/delete
│   │       ├── ingestion.py      # orchestrates upload pipeline
│   │       ├── llm.py            # Gemini wrapper
│   │       ├── rag.py            # retrieve + prompt + generate
│   │       └── study_tools.py    # summary, flashcards, quiz
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── design/
│   │   └── reference.webp        # Visual design reference
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               # router
│       ├── api/                  # client.js, documents.js, chat.js, study.js
│       ├── components/
│       │   ├── layout/           # Navbar.jsx, Layout.jsx, Footer.jsx
│       │   ├── documents/        # UploadBox.jsx, DocumentList.jsx, DocumentCard.jsx
│       │   ├── chat/             # ChatWindow.jsx, MessageBubble.jsx, ChatInput.jsx, SourceCard.jsx, ChatPreviewCard.jsx
│       │   ├── study/            # SummaryPanel.jsx, FlashcardDeck.jsx, QuizPanel.jsx
│       │   └── common/           # Button.jsx, IconButton.jsx, Card.jsx, Badge.jsx, Skeleton.jsx, Loader.jsx, EmptyState.jsx, Reveal.jsx, CountUp.jsx, ConfirmDialog.jsx, PageTransition.jsx, SectionHeading.jsx
│       ├── pages/                # HomePage.jsx, ChatPage.jsx, StudyPage.jsx
│       ├── hooks/                # useDocuments.js, useChat.js, useBackendStatus.js
│       └── styles/index.css
└── data/                         # gitignored: uploads/ and chroma/ created at runtime
```

---

## 5. Environment Variables

**backend/.env.example**
```
GEMINI_API_KEY=your_key_here
LLM_MODEL=gemini-2.5-flash
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
DATABASE_URL=sqlite:///../data/documentor.db
UPLOAD_DIR=../data/uploads
CHROMA_DIR=../data/chroma
MAX_FILE_MB=20
CHUNK_SIZE=800
CHUNK_OVERLAP=150
TOP_K=5
CORS_ORIGINS=http://localhost:5173
```

**frontend/.env.example**
```
VITE_API_BASE_URL=http://localhost:8000
```

Ports: backend `8000`, frontend `5173`. Never commit real `.env` files or API keys.

---

## 6. API Contract (both developers MUST follow this exactly)

Base URL: `http://localhost:8000/api`. All responses are JSON. Errors use `{"detail": "message"}` with a proper HTTP status code.

### Health
`GET /health` -> `{"status": "ok"}`

### Documents
- `POST /documents/upload` — multipart/form-data, field `file`. Allowed: `.pdf .docx .txt .md`, max `MAX_FILE_MB`.
  Response `201`:
  ```json
  {"id": 1, "filename": "os-notes.pdf", "file_type": "pdf", "page_count": 12, "chunk_count": 48, "status": "ready", "created_at": "2026-10-13T14:30:00Z"}
  ```
- `GET /documents` -> `{"documents": [ <Document>, ... ]}`
- `GET /documents/{id}` -> `<Document>`
- `DELETE /documents/{id}` -> `{"message": "Document deleted"}` (also removes its vectors and file)

### Chat
- `POST /chat`
  Request: `{"question": "What is deadlock?", "document_ids": [1, 2], "session_id": null}`
  (`document_ids` empty or omitted = search all documents; `session_id` null = create a new session)
  Response:
  ```json
  {
    "session_id": "b3f1...",
    "answer": "Deadlock is ...",
    "sources": [
      {"document_id": 1, "filename": "os-notes.pdf", "page": 4, "snippet": "A deadlock occurs when ...", "score": 0.82}
    ]
  }
  ```
  If nothing relevant is found, the answer must say the documents do not contain that information (no hallucination) and `sources` is `[]`.
- `GET /chat/history/{session_id}` -> `{"session_id": "...", "messages": [{"role": "user|assistant", "content": "...", "sources": [...], "created_at": "..."}]}`

### Study tools
- `POST /study/summary` — `{"document_id": 1}` -> `{"document_id": 1, "summary": "markdown text"}`
- `POST /study/flashcards` — `{"document_id": 1, "count": 10}` -> `{"document_id": 1, "flashcards": [{"question": "...", "answer": "..."}]}`
- `POST /study/quiz` — `{"document_id": 1, "count": 5}` -> `{"document_id": 1, "questions": [{"question": "...", "options": ["A","B","C","D"], "correct_index": 2, "explanation": "..."}]}`

---

## 7. Coding Rules

**General**
- Keep it simple and readable. Small functions, clear names, short comments where the logic is not obvious.
- No unused code, no hard-coded secrets, no giant files.
- Do not change the API contract without telling the other developer and updating this file and `docs/api.md`.

**Backend**
- Routes stay thin; business logic lives in `services/`.
- Use type hints and Pydantic schemas for every request/response.
- Raise `HTTPException` with clear messages; log errors with the `logging` module.
- The LLM prompt for chat must instruct: "Answer ONLY from the provided context. If the answer is not in the context, say you could not find it in the uploaded documents."
- When asking the LLM for flashcards/quiz, require JSON-only output and validate/parse it safely.

**Frontend**
- Follow `docs/design-system.md` for every visual decision.
- Use `framer-motion` for animation and always respect `prefers-reduced-motion`.
- Functional components + hooks only. All HTTP calls live in `src/api/`, never inside components directly.
- Every async action needs loading, error (toast) and empty states.
- Tailwind utility classes only; keep components small and reusable.

---

## 8. Git Workflow

- Branches: `main` (stable) <- feature branches named `feat/<area>-<short-name>` (e.g. `feat/backend-chunker`, `feat/frontend-chat-ui`).
- Commit after **every completed prompt chunk** using Conventional Commits:
  `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`
- Open a Pull Request for each group of chunks; the other person reviews and merges.
- Pull `main` before starting a new chunk to avoid conflicts.

---

## 9. Definition of Done (per chunk)

1. Code runs without errors.
2. Follows the folder structure and API contract above.
3. No secrets committed.
4. Committed with the suggested commit message.

---

## 10. Build Order (high level)

1. Repo + skeleton (Yash) -> 2. Backend foundation (Yash) || Frontend foundation with mock data (Kaustubh)
3. Ingestion + vector store (Yash) || Upload + library UI (Kaustubh)
4. LLM + RAG chat (Yash) || Chat UI + citations (Kaustubh)
5. Study tools (Yash) || Study UI (Kaustubh)
6. Integration with real backend, tests, polish, docs, Docker (both)
