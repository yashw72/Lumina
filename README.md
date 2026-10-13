# DocuMentor AI

DocuMentor AI is a RAG-powered (Retrieval-Augmented Generation) learning assistant that enables students to upload study material (PDF, DOCX, TXT, MD), chat with their documents with answers strictly grounded in the content and backed by source citations, and generate study aids including summaries, flashcards, and multiple-choice quizzes.

---

## Features

- **Document Ingestion & Library**: Drag-and-drop upload for PDF, DOCX, TXT, and Markdown files up to 20MB with real-time upload progress, embedding processing feedback, file status badges, and deletion confirmations.
- **Strict RAG Document Chat**: Conversational AI assistant whose responses are strictly grounded in user-selected study materials, complete with collapsible page-level source citations and relevance scores.
- **Chat Session Persistence**: Conversations persist across page reloads in `localStorage` and can be restored or cleared with a dedicated "New Chat" option.
- **Executive Study Summaries**: Generates structured Markdown summaries highlighting key objectives, core concepts, theorems, and recommended exam review points.
- **Interactive 3D Flashcards**: Flip cards with front (question) and back (verified answer) views, keyboard navigation (`Space`, `←`, `→`), shuffle capability, and configurable deck sizes (5, 10, 15).
- **Knowledge Check Quizzes**: Multiple-choice quizzes with instant correctness feedback (green/red), comprehensive explanations, dynamic scorekeeping, and end-of-quiz score summary screens.
- **Modern Responsive Design & Dark Mode**: Built with Tailwind CSS, sleek typography, accessible focus states, responsive layouts for mobile/tablet/desktop, and theme toggle persisting in `localStorage`.
- **Backend Health & Error Banner**: Automatic connectivity heartbeat checking every 30s (5s when offline) with retry triggers and human-readable error toasts for 400/404/413/422/500/502 errors.
- **Mock Mode for Offline Development**: Toggleable `VITE_USE_MOCK=true` mode allowing full frontend exploration without requiring the backend server.

---

## Tech Stack

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** (with dark mode support)
- **Lucide React** (icons)
- **React Router DOM v6** (client-side routing)
- **Axios** (REST API client with normalized error interceptors)
- **React Hot Toast** (notifications)
- **React Markdown** (rich text rendering)

### Backend
- Python 3.11+
- FastAPI + Uvicorn
- SQLite + SQLAlchemy
- ChromaDB
- sentence-transformers (`all-MiniLM-L6-v2`)
- Google Gemini API (`google-genai` SDK)
- `pypdf`, `python-docx`
- `pydantic-settings`, `pytest`

---

## Setup & Usage

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
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key to `GEMINI_API_KEY` in `backend/.env`.
5. **Start the backend development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - Swagger documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
6. **Run backend unit and integration tests:**
   ```bash
   pytest
   ```
7. **Run end-to-end API contract smoke test:**
   ```bash
   # Run full contract smoke test:
   python scripts/smoke_test.py

   # Or skip LLM steps if testing without an API key:
   python scripts/smoke_test.py --skip-llm
   ```

### Frontend Setup
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The UI will open at [http://localhost:5173](http://localhost:5173).

---

## Docker Setup

Run the entire full-stack application (backend and frontend) with Docker Compose:

```bash
docker compose up --build
```
- Frontend UI: [http://localhost:5173](http://localhost:5173)
- Backend API & Interactive Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## API Overview
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
    "question": "What is mutual exclusion?",
    "document_ids": [1],
    "session_id": null
  }'
```

---

## Folder Structure

```
documentor-ai/
├── antigravitycontext.md
├── README.md
├── .gitignore
├── docker-compose.yml
├── docs/
│   ├── architecture.md
│   └── api.md
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   ├── api/routes/
│   │   └── services/
│   ├── scripts/
│   │   ├── try_llm.py
│   │   └── smoke_test.py
│   └── tests/
└── frontend/
    ├── package.json
    ├── .env.example
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        ├── components/
        ├── hooks/
        ├── pages/
        └── styles/
```

---

## Team
- **Yash**: Backend, RAG pipeline, vector DB, LLM, study tools, tests (`backend/`)
- **Kaustubh**: Frontend UI, API integration, UX, polish (`frontend/`)
