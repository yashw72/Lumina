# DocuMentor AI

DocuMentor AI is a RAG-powered (Retrieval-Augmented Generation) learning assistant that enables students to upload study material (PDF, DOCX, TXT, MD), chat with their documents with answers strictly grounded in the content and backed by source citations, and generate study aids including summaries, flashcards, and multiple-choice quizzes.

## Tech Stack

### Backend
- Python 3.11+
- FastAPI + Uvicorn
- SQLite + SQLAlchemy
- ChromaDB
- sentence-transformers (`all-MiniLM-L6-v2`)
- Google Gemini API (`google-genai` SDK)
- `pypdf`, `python-docx`
- `pydantic-settings`, `pytest`

### Frontend
- React 18 + Vite
- Tailwind CSS
- `react-router-dom`, `axios`, `react-hot-toast`, `lucide-react`, `react-markdown`

## Folder Structure

```
documentor-ai/
├── antigravitycontext.md
├── README.md
├── .gitignore
├── docker-compose.yml
├── docs/
│   ├── architecture.md           # RAG flow + diagram
│   └── api.md                    # API contract copy
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── pytest.ini
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
│   ├── scripts/
│   │   └── try_llm.py
│   └── tests/
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── index.html
│   └── src/
└── data/                         # gitignored: uploads/ and chroma/ created at runtime
```

## Setup

### Backend Setup
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .\.venv\Scripts\Activate.ps1
   # macOS / Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Copy `.env.example` to `.env` and supply your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Set `GEMINI_API_KEY=your_actual_gemini_api_key` in `backend/.env`.

## Usage

### Run Backend Server
From `backend/`:
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000/api`
- Swagger UI Documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Run Tests
From `backend/`:
```bash
pytest -q
```

### Docker
To run with Docker Compose:
```bash
docker compose up backend --build
```

## API

See [`docs/api.md`](docs/api.md) for the complete API contract.

### Example: Upload a Document
```bash
curl -X POST "http://localhost:8000/api/documents/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_notes.pdf"
```

### Example: Chat with Document
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the primary function of an operating system kernel?",
    "document_ids": [1],
    "session_id": null
  }'
```

## Team
- **Yash**: Backend, RAG pipeline, vector DB, LLM, study tools, tests (`backend/`)
- **Kaustubh**: Frontend UI, API integration, UX, polish (`frontend/`)
