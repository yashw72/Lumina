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

## Frontend Setup

### Prerequisites
- Node.js 18+ (tested with Node 20 / 24)
- npm 9+

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `frontend/` directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Configuration options:
```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8000

# Set to true to test the UI with realistic mock data without the backend running
VITE_USE_MOCK=false
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be accessible at [http://localhost:5173](http://localhost:5173).

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## Docker Setup

Run the full stack (backend and frontend) with Docker Compose:

```bash
docker compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API & Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Screenshots

### 1. Document Library & Drag-and-Drop Upload
<!-- Add screenshot: docs/screenshots/home-library.png -->
*(Screenshot placeholder: Document library with file cards, upload progress, and status badges)*

### 2. Grounded Chat with Source Citations
<!-- Add screenshot: docs/screenshots/chat-citations.png -->
*(Screenshot placeholder: RAG chat interface showing markdown answers and collapsible source snippets with page numbers)*

### 3. Interactive 3D Flashcards
<!-- Add screenshot: docs/screenshots/flashcards.png -->
*(Screenshot placeholder: 3D flip card with question, answer, shuffle, and deck progress)*

### 4. Practice Quiz & Knowledge Check
<!-- Add screenshot: docs/screenshots/quiz.png -->
*(Screenshot placeholder: Multiple choice quiz with immediate correctness indicator and explanation)*

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
│   └── app/
└── frontend/
    ├── package.json
    ├── .env.example
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/                  # client.js, documents.js, chat.js, study.js, mock.js
        ├── components/
        │   ├── layout/           # Navbar.jsx, Layout.jsx
        │   ├── documents/        # UploadBox.jsx, DocumentList.jsx, DocumentCard.jsx
        │   ├── chat/             # ChatWindow.jsx, MessageBubble.jsx, ChatInput.jsx, SourceCard.jsx
        │   ├── study/            # SummaryPanel.jsx, FlashcardDeck.jsx, QuizPanel.jsx
        │   └── common/           # Button.jsx, Loader.jsx, EmptyState.jsx, BackendBanner.jsx
        ├── pages/                # HomePage.jsx, ChatPage.jsx, StudyPage.jsx
        ├── hooks/                # useDocuments.js, useChat.js, useBackendStatus.js
        └── styles/index.css
```

---

## Team

- **Yash**: Backend, RAG pipeline, vector DB, LLM, study tools, tests (`backend/`)
- **Kaustubh**: Frontend UI, API integration, UX, polish (`frontend/`)
