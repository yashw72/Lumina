# Yash.md — Backend and RAG Prompts (DocuMentor AI)

**Your role:** Backend, RAG pipeline, vector database, LLM, study tools, tests.
**Your folder:** `backend/` (plus repo setup in Chunk 1).

## How to use this file
1. Put `antigravitycontext.md` in the repo root. Every prompt below starts by telling Antigravity to read it.
2. Paste ONE chunk's prompt into Antigravity at a time. Wait until it finishes and run/test the result.
3. Run the **Check** step. If it works, run the **Commit** commands.
4. Move to the next chunk. Do not skip chunks.
5. Work on a feature branch and open a PR to `main` after every 2-3 chunks.

> Kaustubh waits for your **Chunk 1** to be pushed to GitHub, then clones it and starts his own chunks. Your chunks 2-12 and his chunks 2-10 then run in parallel.

---

## CHUNK 1 — Repository bootstrap and folder structure

**Prompt**
```text
Read antigravitycontext.md fully first.

Task: Bootstrap the repository for DocuMentor AI.
1. Create the complete folder structure from section 4 of antigravitycontext.md. Create empty placeholder files (a .gitkeep or an empty __init__.py for Python packages) so Git tracks every folder. Do NOT write any application logic yet.
2. Create a root .gitignore covering: Python (__pycache__, .venv, *.pyc), Node (node_modules, dist), env files (.env, but NOT .env.example), the data/ folder, .DS_Store, IDE folders (.vscode, .idea).
3. Create a root README.md with: project name, one-paragraph description, tech stack list, the folder structure, and placeholder sections "Setup", "Usage", "API", "Team". Keep it short.
4. Create docs/architecture.md with the RAG flow from section 1 of the context file written as a simple text diagram.
5. Create docs/api.md by copying the API contract from section 6 of the context file.
6. Create backend/.env.example and frontend/.env.example exactly as in section 5.
```

**Check:** Folder tree matches the context file; `git status` shows no `.env` or `data/` files.

**Commit**
```bash
git init
git branch -M main
git add .
git commit -m "chore: initialize repo with folder structure, gitignore and docs"
git remote add origin <your-github-repo-url>
git push -u origin main
```
> Tell Kaustubh to clone the repo now.

---

## CHUNK 2 — FastAPI skeleton, config and health route

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Build the FastAPI foundation.
1. Create backend/requirements.txt with: fastapi, uvicorn[standard], sqlalchemy, pydantic-settings, python-multipart, python-dotenv, chromadb, sentence-transformers, pypdf, python-docx, google-genai, pytest, httpx.
2. app/core/config.py: a pydantic-settings Settings class that loads every variable from section 5 (backend/.env.example) with sensible defaults, exposing a cached get_settings() function. Make CORS_ORIGINS parse into a list.
3. app/core/logging.py: a setup_logging() function with a readable log format.
4. app/api/routes/health.py: GET /api/health returning {"status": "ok"}.
5. app/main.py: create the FastAPI app (title "DocuMentor AI"), call setup_logging, add CORS middleware using settings.CORS_ORIGINS, include the health router with prefix /api, and create the data folders (UPLOAD_DIR, CHROMA_DIR) on startup if they do not exist.
Then give me the exact commands to create a venv, install requirements and run the server with uvicorn on port 8000.
```

**Check:** `uvicorn app.main:app --reload` runs; open `http://localhost:8000/api/health` and `/docs`.

**Commit**
```bash
git checkout -b feat/backend-foundation
git add backend/
git commit -m "feat(backend): add FastAPI app, settings, logging and health endpoint"
```

---

## CHUNK 3 — Database layer (SQLite + SQLAlchemy)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Add the database layer.
1. app/db/database.py: SQLAlchemy engine from settings.DATABASE_URL (with check_same_thread=False for SQLite), SessionLocal, declarative Base, and a get_db() FastAPI dependency.
2. app/db/models.py with three models:
   - Document: id, filename, file_type, stored_path, page_count, chunk_count, status (default "processing"; later "ready" or "failed"), created_at.
   - ChatSession: id (string UUID primary key), created_at.
   - ChatMessage: id, session_id (FK to ChatSession), role ("user" or "assistant"), content (text), sources_json (text, nullable), created_at.
3. Create tables on app startup in main.py using Base.metadata.create_all.
4. app/schemas/document.py: Pydantic schemas DocumentOut (fields exactly as the Document JSON in the API contract, with from_attributes enabled) and DocumentListOut ({"documents": [...]}).
Keep everything simple, no migrations.
```

**Check:** Start the server; `data/documentor.db` is created with the three tables.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add SQLAlchemy models for documents and chat history"
```

---

## CHUNK 4 — File loaders (PDF, DOCX, TXT, MD)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Build app/services/loaders.py.
1. A function load_document(file_path: str, file_type: str) -> list[dict] that returns a list of {"page": int, "text": str}.
   - pdf: use pypdf, one entry per page (page numbers start at 1), skip pages with no extractable text.
   - docx: use python-docx, join paragraphs; treat the whole file as page 1.
   - txt and md: read as UTF-8 (errors="ignore"), treat as page 1.
2. A small clean_text() helper: collapse repeated whitespace/newlines, strip null characters, trim.
3. Raise a clear ValueError for unsupported file types and for documents where no text could be extracted (for example scanned PDFs), with a friendly message.
4. Add backend/tests/test_loaders.py with tests for txt/md loading and clean_text (create temp files with pytest's tmp_path).
```

**Check:** `pytest backend/tests -q` passes.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add document loaders for pdf, docx, txt and md"
```

---

## CHUNK 5 — Text chunking

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Build app/services/chunker.py.
1. chunk_pages(pages: list[dict], chunk_size: int, overlap: int) -> list[dict].
   Input is the output of loaders.load_document. Output is a list of {"text": str, "page": int, "chunk_index": int}.
2. Split by characters with the given size and overlap, but try to break at sentence or paragraph boundaries (". ", "\n") instead of cutting words in half. Chunks must never cross page boundaries so every chunk has a single correct page number. Skip chunks shorter than 30 characters.
3. chunk_index must be unique and increasing across the whole document.
4. Use CHUNK_SIZE and CHUNK_OVERLAP from settings as defaults.
5. Add backend/tests/test_chunker.py covering: overlap works, page numbers are preserved, chunk_index is sequential, tiny chunks are skipped.
```

**Check:** `pytest -q` passes.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add page-aware text chunker with overlap"
```

---

## CHUNK 6 — Embeddings and ChromaDB vector store

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Add embeddings and the vector store.
1. app/services/embeddings.py: load the sentence-transformers model named by settings.EMBEDDING_MODEL lazily (only once, cached). Provide embed_texts(texts: list[str]) -> list[list[float]] and embed_query(text: str) -> list[float]. Normalize embeddings.
2. app/services/vector_store.py using chromadb.PersistentClient(path=settings.CHROMA_DIR) and ONE collection named "documents" with cosine distance:
   - add_chunks(document_id: int, filename: str, chunks: list[dict]): store ids like "doc{document_id}-chunk{chunk_index}", the embeddings, the chunk text as documents, and metadata {document_id, filename, page, chunk_index}.
   - query(query_embedding, top_k: int, document_ids: list[int] | None) -> list[dict]: return [{"document_id","filename","page","text","score"}] where score = 1 - cosine distance. If document_ids is given, filter with a "where" clause on document_id (use $in).
   - delete_document(document_id: int): remove all chunks of that document.
3. Add backend/tests/test_vector_store.py that uses a temporary Chroma directory (monkeypatch settings) to add chunks, query and delete.
```

**Check:** Tests pass (the first run downloads the embedding model — this is normal).

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add sentence-transformer embeddings and ChromaDB vector store"
```

---

## CHUNK 7 — Upload / list / delete document endpoints

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Wire the ingestion pipeline and document endpoints exactly as in the API contract.
1. app/services/ingestion.py: ingest_document(db, document: Document) -> Document. Steps: load pages (loaders) -> chunk (chunker) -> embed (embeddings) -> store (vector_store) -> update page_count, chunk_count and set status "ready". On any exception set status "failed", log it, and re-raise a friendly error.
2. app/api/routes/documents.py with prefix /documents:
   - POST /upload: validate extension (.pdf .docx .txt .md) and size (MAX_FILE_MB), save the file to UPLOAD_DIR with a unique safe name (uuid prefix, never trust the client filename for the path), create the Document row, run ingest_document, return 201 with DocumentOut. On failure delete the saved file and DB row and return 400/422 with a clear {"detail": ...}.
   - GET "": list documents, newest first.
   - GET /{id}: one document or 404.
   - DELETE /{id}: delete vectors, uploaded file and DB row; return {"message": "Document deleted"}; 404 if missing.
3. Register the router in main.py under /api.
4. Add backend/tests/test_documents_api.py using FastAPI TestClient and a small .txt upload to test upload, list and delete (monkeypatch settings to use temp folders).
```

**Check:** In `/docs`, upload a PDF, list it, delete it. Confirm the file disappears from `data/uploads`.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add document upload, list and delete endpoints with ingestion pipeline"
```
> Push the branch, open a PR, and tell Kaustubh the upload API is ready for real integration.

---

## CHUNK 8 — LLM service (Gemini)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Build app/services/llm.py, a thin wrapper around the Google Gemini API using the google-genai SDK.
1. A function generate(prompt: str, system_instruction: str | None = None, temperature: float = 0.2) -> str that calls the model from settings.LLM_MODEL with GEMINI_API_KEY.
2. A function generate_json(prompt: str, system_instruction: str | None = None) -> dict | list that asks for JSON-only output, strips markdown code fences if present, parses it with json.loads and raises a clear error if parsing fails. Retry once on a parse failure.
3. If GEMINI_API_KEY is missing, raise a clear RuntimeError telling the developer to set it in backend/.env.
4. Handle API errors (rate limits, network) by logging and raising an HTTPException-friendly custom LLMError.
5. Keep this file provider-specific only here, so the rest of the app never imports the SDK directly.
Provide a tiny script backend/scripts/try_llm.py that sends "Say hello in one sentence" so I can test my key.
```

**Check:** Create `backend/.env` from the example, add your key, run `python scripts/try_llm.py`.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add Gemini LLM service wrapper with JSON helper"
```

---

## CHUNK 9 — RAG pipeline and chat endpoints

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Implement the RAG chat feature exactly as in the API contract.
1. app/schemas/chat.py: ChatRequest (question, document_ids optional list[int], session_id optional str), Source, ChatResponse, HistoryResponse.
2. app/services/rag.py: answer_question(db, question, document_ids, session_id) that:
   a. embeds the question and retrieves TOP_K chunks from vector_store (filtered by document_ids when provided);
   b. if there are no chunks or the best score is below 0.25, return a friendly "I could not find this in your uploaded documents" answer with sources = [] (do NOT call the LLM);
   c. otherwise builds a prompt containing numbered context blocks (with filename and page) plus the last 4 messages of the session as conversation history, and a system instruction that says: answer ONLY from the context, be clear and educational, and say so if the context is insufficient;
   d. calls llm.generate and returns the answer with deduplicated sources (document_id, filename, page, snippet of max 200 characters, score rounded to 2 decimals).
3. Persist the user message and the assistant message (with sources as JSON) in ChatMessage; create a ChatSession with a uuid4 when session_id is null.
4. app/api/routes/chat.py: POST /chat and GET /chat/history/{session_id} (404 if the session does not exist). Register under /api.
5. Add tests for the "no relevant chunks" path by mocking vector_store and llm.
```

**Check:** Upload a document, ask a question in `/docs`, confirm sources are correct; ask something unrelated and confirm the "not found" answer.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add RAG pipeline with grounded answers, sources and chat history"
```

---

## CHUNK 10 — Study tools (summary, flashcards, quiz)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Implement the study tools exactly as in the API contract.
1. app/schemas/study.py: request/response schemas for summary, flashcards and quiz.
2. app/services/study_tools.py:
   - get_document_text(document_id) helper: fetch the document's chunks from ChromaDB ordered by chunk_index and join them; if the text is longer than about 12000 characters, sample evenly spaced chunks so it fits.
   - generate_summary(document_id) -> markdown string with headings and bullet points (key concepts, definitions, takeaways).
   - generate_flashcards(document_id, count) -> list of {"question","answer"} using llm.generate_json.
   - generate_quiz(document_id, count) -> list of {"question","options"(exactly 4),"correct_index"(0-3),"explanation"} using llm.generate_json.
   Validate the parsed JSON (correct keys, 4 options, valid correct_index, at most count items) and drop invalid items. Clamp count to 1-20.
3. app/api/routes/study.py: POST /study/summary, /study/flashcards, /study/quiz. Return 404 if the document does not exist or is not "ready", and 502 with a friendly message when LLMError happens.
4. Register under /api and add tests with mocked llm.generate_json for the validation logic.
```

**Check:** Generate all three for one uploaded document in `/docs`.

**Commit**
```bash
git add backend/
git commit -m "feat(backend): add summary, flashcard and quiz generation endpoints"
```
> Open a PR and tell Kaustubh that chat and study endpoints are ready.

---

## CHUNK 11 — Hardening: errors, validation and tests

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Make the backend robust.
1. Add a global exception handler for LLMError and unexpected exceptions that returns {"detail": "..."} JSON without leaking stack traces, and logs the real error.
2. Validate inputs: non-empty question (max 2000 characters), document_ids must exist (404 otherwise), count ranges, empty file uploads rejected.
3. Make sure deleting a document that is part of a chat does not crash later chats (filtering by a missing document id should just return no sources).
4. Add a basic end-to-end test of upload -> chat (with mocked llm) -> delete.
5. Add backend/pytest.ini and make sure `pytest` runs from the backend folder with all tests passing.
6. Run a quick review of the backend for unused imports and obvious bugs and fix them.
```

**Check:** `pytest` is fully green.

**Commit**
```bash
git add backend/
git commit -m "fix(backend): add validation, global error handling and end-to-end test"
```

---

## CHUNK 12 — Backend docs and Docker

**Prompt**
```text
Read antigravitycontext.md first.

Task: Finish backend documentation and containerization.
1. Create backend/Dockerfile (python:3.11-slim, install requirements, run uvicorn on 0.0.0.0:8000). Pre-download the embedding model during the build if it keeps startup fast.
2. Create a root docker-compose.yml with a backend service (port 8000, env_file backend/.env, a volume for ./data) and a frontend service placeholder that Kaustubh will complete.
3. Update README.md "Setup", "Usage" and "API" sections for the backend: venv setup, env variables, running the server, running tests, and a curl example for upload and chat.
4. Update docs/architecture.md with the final backend module diagram and describe what each file in backend/app/services does.
```

**Check:** `docker compose up backend` starts and `/api/health` responds.

**Commit**
```bash
git add .
git commit -m "docs: add backend Dockerfile, docker-compose and setup documentation"
git push origin feat/backend-foundation
```

---

## FINAL CHECKLIST (Yash)
- [ ] All endpoints in the API contract work in `/docs`
- [ ] `pytest` passes
- [ ] No `.env` or API key committed
- [ ] README setup steps tested from a fresh clone
- [ ] PRs reviewed and merged by Kaustubh
