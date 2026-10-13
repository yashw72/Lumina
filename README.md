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
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx               # router
│       ├── api/                  # client.js, documents.js, chat.js, study.js
│       ├── components/
│       │   ├── layout/           # Navbar.jsx, Sidebar.jsx
│       │   ├── documents/        # UploadBox.jsx, DocumentList.jsx, DocumentCard.jsx
│       │   ├── chat/             # ChatWindow.jsx, MessageBubble.jsx, ChatInput.jsx, SourceCard.jsx
│       │   ├── study/            # SummaryPanel.jsx, FlashcardDeck.jsx, QuizPanel.jsx
│       │   └── common/           # Button.jsx, Loader.jsx, EmptyState.jsx
│       ├── pages/                # HomePage.jsx, ChatPage.jsx, StudyPage.jsx
│       ├── hooks/                # useDocuments.js, useChat.js
│       └── styles/index.css
└── data/                         # gitignored: uploads/ and chroma/ created at runtime
```

## Setup
<!-- Instructions for installing backend and frontend dependencies -->

## Usage
<!-- Instructions for running backend and frontend development servers -->

## API
See [docs/api.md](docs/api.md) for the complete API contract.

## Team
- **Yash**: Backend, RAG pipeline, vector DB, LLM, study tools, tests (`backend/`)
- **Kaustubh**: Frontend UI, API integration, UX, polish (`frontend/`)
