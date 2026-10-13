# Integration.md — Frontend ↔ Backend Integration Prompts (DocuMentor AI)

**Owners:** Yash (backend side) and Kaustubh (frontend side). Each chunk says who runs it.
**Rule reminder:** Yash edits only `backend/`, Kaustubh only `frontend/`. Shared files (`docker-compose.yml`, `README.md`, `docs/`, `antigravitycontext.md`) go through a Pull Request reviewed by the other person.

## Why this file exists

`Yash.md` (12 chunks) and `Kaustubh.md` (10 chunks) build both halves correctly, but the only integration step is Kaustubh's Chunk 9. A review of both files found these gaps, which would cause real bugs when the two halves meet:

| # | Gap found | What would happen | Fixed in |
|---|---|---|---|
| 1 | `vector_store.py` (Chunk 6) has no function to read all chunks of one document, but `study_tools.py` (Chunk 10) needs it | Summary / flashcards / quiz cannot fetch the document text | INT-1 |
| 2 | Upload and embedding are CPU-heavy; routes may be `async def` | The server freezes during an upload and `/health` stops answering | INT-1 |
| 3 | A 500 error is produced outside `CORSMiddleware` | The browser shows "Network Error" instead of the real message | INT-1 |
| 4 | `DATABASE_URL=sqlite:///../data/...` is relative to the working directory | Breaks in Docker, in pytest from another folder, or when started from the repo root | INT-1 |
| 5 | FastAPI 422 errors return `detail` as a **list**, not a string | The frontend toast shows `[object Object]` | INT-1, INT-2 |
| 6 | The embedding model loads on the first request | The first upload or chat takes 20-60 s and can time out | INT-1, INT-2 |
| 7 | Follow-up questions like "explain more" are embedded alone | Retrieval finds nothing, answer says "not found" | INT-1 |
| 8 | `GET /chat/history` and session persistence are never used by the UI | Refreshing the page loses the conversation | INT-2 |
| 9 | Deleting a document that is selected in chat is not handled in the UI | Stale `document_ids` are sent and the user sees a 404 | INT-2 |
| 10 | No automated end-to-end check across the whole stack | Nobody knows whether the full flow works until the demo | INT-3, INT-4 |
| 11 | nginx without SPA fallback, plus a CORS port mismatch in Docker | Refreshing `/chat` gives 404; the browser blocks the API | INT-5 |
| 12 | No final contract audit, demo script or release step | Docs drift from code; unprepared demo | INT-6 |

## Recommended order

```
Yash   : Chunks 1-12 ........ then INT-1 ............ INT-3 ..... INT-5a
Kaustubh: Chunks 1-8 (+UI-Design chunks) ... Chunk 9 ... INT-2 ... INT-5b
Both   :                                          INT-4 (together) ........ INT-6
```

- Run **INT-1** after Yash's Chunk 10 and before Kaustubh's Chunk 9.
- Run **INT-2** right after Kaustubh's Chunk 9 (it adds to it; skip anything already done).
- Run **INT-3** once INT-1 is merged. Run **INT-4** together, on one machine or a screen share.

---

## INT-1 — Backend integration fixes (run by Yash)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Fix the backend issues that appear only when a real frontend talks to it.
1. vector_store.py: add get_document_chunks(document_id: int) -> list[dict] returning [{"text","page","chunk_index"}] ordered by chunk_index. Make study_tools.get_document_text use it (if it already fetches chunks another way, switch it to this function). Add a test.
2. Blocking work: make sure every route that does file IO, embedding, ChromaDB or LLM calls is a plain "def" (FastAPI runs it in a threadpool) and not "async def", so /api/health stays responsive during an upload.
3. Warm up: load the embedding model at application startup using a FastAPI lifespan handler in a background thread, and log "Embedding model ready". The first upload must not pay the model-loading cost.
4. Paths: in core/config.py resolve DATABASE_URL (sqlite relative paths), UPLOAD_DIR and CHROMA_DIR relative to the PROJECT ROOT (the folder that contains backend/ and data/), not the current working directory. Environment values that are already absolute must be kept as they are. Create the folders on startup. Add a test.
5. CORS_ORIGINS: accept a comma-separated list in the env value. Keep the default http://localhost:5173 and also allow http://127.0.0.1:5173.
6. Error format: register handlers so that
   - RequestValidationError returns status 422 with {"detail": "<one readable sentence, e.g. 'question: field required'>"} (a STRING, not a list);
   - the generic Exception handler returns 500 {"detail": "Something went wrong on the server"} and ALSO adds Access-Control-Allow-Origin (only when the request Origin is in CORS_ORIGINS) and Vary: Origin headers, because Starlette runs this handler outside CORSMiddleware and the browser would otherwise hide the message behind a "Network Error";
   - uploads larger than MAX_FILE_MB return 413 with a clear detail.
7. Follow-up questions: in rag.answer_question, if the question has fewer than 6 words and the session has a previous user message, build the RETRIEVAL query as "<previous user question> <current question>" (the prompt still shows the original question).
8. Do NOT change the API contract or the GET /api/health response.
9. Add or update tests for items 1, 4, 6 and 7 and make sure pytest is green.
```

**Check:** `pytest` is green. Start the server from the repo root AND from `backend/`; both use the same `data/` folder. Upload a big file while opening `/api/health` in another tab: health responds instantly. `curl -X POST localhost:8000/api/chat -H "Content-Type: application/json" -d "{}"` returns a single-sentence string `detail`.

**Commit**
```bash
git checkout main && git pull
git checkout -b feat/backend-integration-fixes
git add backend/
git commit -m "fix(backend): add chunk reader, threadpool routes, CORS-safe errors and root-relative paths"
git push origin feat/backend-integration-fixes
```
> Open a PR, ask Kaustubh to review, then tell him "backend is integration-ready".

---

## INT-2 — Frontend integration hardening (run by Kaustubh, after his Chunk 9)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/. This chunk ADDS to Chunk 9; skip anything that already exists and tell me what you skipped.

Task: Make the frontend behave correctly against the real backend.
1. src/api/client.js: normalise every error into an Error with {message, status, isNetwork}.
   - response.data.detail may be a STRING or an ARRAY of {loc, msg}; if it is an array, join "loc.join('.'): msg" into one readable sentence.
   - No response at all => isNetwork = true, message "Cannot reach the server".
   - Timeouts: default 30 s, chat 60 s, study endpoints 90 s, upload 120 s (the first request after a cold start can be slow). A timeout message should say "This is taking longer than usual, please try again".
2. src/hooks/useBackendStatus.js: pings GET /health (using the API base URL) every 30 s, and every 5 s while it is failing. Expose {online, checking, retry}. Add src/components/common/BackendBanner.jsx shown at the top of the Layout only when offline: "Backend is not reachable at <base url>. Start it with uvicorn, or check CORS_ORIGINS if it is running." with a Retry button. Animate it in and out.
3. Chat session persistence in useChat.js: keep sessionId and selected documentIds in localStorage (key "documentor.chat"). On ChatPage mount, if a sessionId exists call getHistory(sessionId) and restore the messages (including sources). If getHistory returns 404, silently clear the stored session. Add a "New chat" button that clears messages, sessionId and storage.
4. Deleted-document safety: when a document is removed (useDocuments.remove), also remove its id from the chat selection and from localStorage. Before every chat request, drop selected ids that no longer exist in the document list; if none are left, fall back to "all documents". Never send ids of documents whose status is not "ready".
5. Prevent double submits (ignore send while sending, disable the generate buttons while loading) and cancel in-flight requests on unmount with AbortController so no state updates happen on an unmounted component.
6. Dev-only contract guard: in client.js when import.meta.env.DEV is true, console.warn if a response is missing the keys listed in section 6 of antigravitycontext.md (for example "documents" for GET /documents, "answer" and "sources" for POST /chat). No warnings in production.
7. Make sure the first upload shows "Processing document..." for as long as the request is running (the backend embeds before it responds) and that a failed upload shows the backend's message in a toast.
Summarise what you changed.
```

**Check:** Stop the backend → the banner appears, start it → the banner disappears by itself. Refresh `/chat` mid-conversation → messages return. Delete a selected document → chat still works. Send a request with an empty question via the UI → readable toast, not `[object Object]`.

**Commit**
```bash
git checkout main && git pull
git checkout -b feat/frontend-integration-hardening
git add frontend/
git commit -m "feat(frontend): add backend status banner, session restore and robust error handling"
git push origin feat/frontend-integration-hardening
```

---

## INT-3 — Full-stack smoke test script (run by Yash)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside backend/.

Task: Create backend/scripts/smoke_test.py, a single script that checks the whole running API against the contract in section 6.
1. Use httpx (already in requirements). Arguments: --base-url (default http://localhost:8000/api) and --skip-llm (skips chat and study steps that need a Gemini key).
2. Steps, each printed as "PASS" or "FAIL <reason>":
   a. GET /health == {"status":"ok"}
   b. POST /documents/upload with a small generated .txt about operating-system deadlocks (about 15 sentences) -> 201, status "ready", chunk_count >= 1
   c. GET /documents contains the new id; GET /documents/{id} works
   d. Upload a .exe-named file -> 4xx with a string detail
   e. POST /chat with a question that the text answers -> non-empty answer and at least one source with document_id, filename, page, snippet, score; remember session_id
   f. POST /chat with the same session_id and a short follow-up ("why does it happen?") -> same session_id returned
   g. POST /chat with an unrelated question ("capital of France") and only that document_ids -> sources == []
   h. GET /chat/history/{session_id} -> 4 messages
   i. POST /study/summary, /study/flashcards (count 5), /study/quiz (count 3) -> shapes valid: every quiz item has exactly 4 options and correct_index in 0-3
   j. POST /chat with {"question": ""} -> 422 with a string detail
   k. DELETE /documents/{id} -> message "Document deleted"; GET /documents/{id} -> 404
3. Always delete the test document at the end, even if a step fails. Print a summary table and exit with code 1 if anything failed.
4. Document how to run it in the README "Usage" section.
```

**Check:** With the server running and a valid key, `python scripts/smoke_test.py` shows all PASS.

**Commit**
```bash
git checkout main && git pull
git checkout -b feat/backend-smoke-test
git add backend/ README.md
git commit -m "test(backend): add end-to-end smoke test script for the full API contract"
git push origin feat/backend-smoke-test
```

---

## INT-4 — Integration test checklist and contract audit (run by BOTH, together)

**Step A — one person creates the checklist (Kaustubh, via PR)**

**Prompt**
```text
Read antigravitycontext.md first.

Task: Create docs/testing.md containing a manual end-to-end checklist as a Markdown table with columns: ID, Area, Steps, Expected, Result (empty).
Cover at least these cases:
- Upload: PDF, DOCX, TXT, MD; a 25 MB file; a .png file; an empty file; a scanned (image-only) PDF; the same file twice; drag and drop; cancel by closing the tab.
- Library: card details, status badge, delete with confirmation, empty state, refresh keeps the list.
- Chat: question with answer in the file; unrelated question (must say not found, no sources); follow-up in the same session; selecting one of two documents (sources only from that one); sources show correct page; copy button; Enter vs Shift+Enter; refresh restores the conversation; "New chat" resets.
- Study: summary, flashcards (5/10/15), quiz (5/10), regenerate, flip and shuffle, quiz score screen.
- Failure modes: backend stopped (banner), wrong Gemini key (friendly 502 toast), very slow response, document deleted while selected in chat.
- UI: mobile 390 px, tablet 768 px, desktop 1440 px, dark mode, keyboard-only navigation.
Add a short "How to report a bug" paragraph at the end.
```

**Step B — each person runs this audit in their own folder**

**Prompt (Yash)**
```text
Read antigravitycontext.md and docs/api.md first. Work only inside backend/ (read-only elsewhere).
Task: Audit the backend against section 6 of the context file. For every endpoint compare path, method, status codes, request fields and response fields with the Pydantic schemas and routes. Produce a table of mismatches (endpoint, expected, actual) and fix every mismatch inside backend/. If a fix would need a contract change, do NOT change it: list it for discussion instead.
```

**Prompt (Kaustubh)**
```text
Read antigravitycontext.md and docs/api.md first. Work only inside frontend/ (read-only elsewhere).
Task: Audit src/api/*.js and every component that reads API data against section 6 of the context file. Check URLs, methods, snake_case request fields, and every response field name used in the UI (document_ids, session_id, correct_index, created_at, score...). Produce a table of mismatches (file, expected, actual) and fix every mismatch inside frontend/. If a fix would need a contract change, do NOT change it: list it for discussion instead.
```

**Step C — walk through `docs/testing.md` together**, fill in the Result column, and fix every failure in the owner's folder.

**Check:** Every row of the table is PASS or has a linked GitHub issue.

**Commit**
```bash
git checkout main && git pull
git checkout -b docs/integration-testing
git add docs/testing.md
git commit -m "docs: add end-to-end manual testing checklist"
# after fixes (each person in their own folder):
git commit -m "fix(frontend): resolve integration issues found during end-to-end testing"
git commit -m "fix(backend): resolve integration issues found during end-to-end testing"
```

---

## INT-5 — Docker full stack (INT-5a Yash, INT-5b Kaustubh, then one PR)

**INT-5a Prompt (Yash)**
```text
Read antigravitycontext.md first. Work only inside backend/ and the root docker-compose.yml.

Task: Make the backend container production-like.
1. backend/Dockerfile: python:3.11-slim, install torch from the CPU wheel index before requirements to keep the image small, install requirements, pre-download the embedding model at build time, run as a non-root user, run uvicorn on 0.0.0.0:8000. Add a .dockerignore (venv, __pycache__, .env, tests data).
2. docker-compose.yml backend service: build ./backend, env_file backend/.env, environment overrides DATABASE_URL=sqlite:////app/data/documentor.db, UPLOAD_DIR=/app/data/uploads, CHROMA_DIR=/app/data/chroma and CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173, volume ./data:/app/data, port 8000:8000, and a healthcheck calling /api/health (start_period 60s because of the model warm-up).
3. Verify: docker compose up --build backend, then run scripts/smoke_test.py against it. Data must survive docker compose down and up.
```

**INT-5b Prompt (Kaustubh)**
```text
Read antigravitycontext.md first. Work only inside frontend/ and the frontend service of the root docker-compose.yml.

Task: Finish the frontend container.
1. frontend/Dockerfile: multi-stage; stage 1 node:20-alpine runs npm ci and npm run build with ARG VITE_API_BASE_URL (default http://localhost:8000) and VITE_USE_MOCK=false; stage 2 nginx:alpine serves dist/.
2. frontend/nginx.conf: SPA fallback ("try_files $uri /index.html;") so refreshing /chat or /study works, gzip on, long cache for hashed assets, no cache for index.html. Add a .dockerignore.
3. docker-compose.yml frontend service: build with the build arg, port mapping 5173:80 (so the browser origin stays http://localhost:5173 and matches the backend CORS_ORIGINS), depends_on backend with condition service_healthy.
4. Verify: docker compose up --build from the repo root; open http://localhost:5173, refresh /study (no 404), upload a file and chat.
```

**Check:** From a clean clone: copy `backend/.env.example` to `backend/.env`, add the key, run `docker compose up --build`, and the full flow works at `http://localhost:5173`.

**Commit**
```bash
git checkout main && git pull
git checkout -b chore/docker-full-stack
git add backend/ frontend/ docker-compose.yml
git commit -m "chore: add production-ready Docker setup for backend and frontend with healthchecks"
git push origin chore/docker-full-stack
```

---

## INT-6 — Docs, contract sync, demo script and release (run by BOTH via PR)

**Prompt**
```text
Read antigravitycontext.md first.

Task: Finalise documentation and the release.
1. Compare docs/api.md with section 6 of antigravitycontext.md and with the real routes; make all three identical. Add the error responses (400, 404, 413, 422, 500, 502) with examples.
2. Rewrite README.md as a complete project page: logo/title, one-line pitch, features, a "How RAG works here" diagram, tech stack, quick start (local: backend, frontend; Docker: one command), environment variables table, running tests, running scripts/smoke_test.py, project structure, API overview, screenshots section (images in docs/screenshots/), team (Yash: backend, Kaustubh: frontend) and troubleshooting (Gemini key, CORS, first start is slow because the embedding model downloads, port in use).
3. Create docs/demo-script.md: a 5-minute faculty demo. Include a prepared sample document to upload (create docs/sample/operating-systems-notes.md with about 1 page of notes), 5 questions to ask (3 answerable, 1 follow-up, 1 deliberately out of scope to show "not found" instead of hallucination), then summary, flashcards and quiz, plus what to say about RAG at each step and answers to likely questions (Why RAG? Why ChromaDB? How are hallucinations reduced? What is the chunk size and why?).
4. Update antigravitycontext.md section 10 with the final status and add a "Known limitations" list (no auth, single-user, scanned PDFs not supported, one collection for all users).
```

**Check:** A person who has never seen the project can run it from the README alone.

**Commit**
```bash
git checkout main && git pull
git checkout -b docs/final-documentation
git add README.md docs/ antigravitycontext.md
git commit -m "docs: finalize README, API reference, demo script and known limitations"
git push origin docs/final-documentation
# after the PR is merged:
git checkout main && git pull
git tag -a v1.0.0 -m "DocuMentor AI first complete release"
git push origin v1.0.0
```

---

## FINAL INTEGRATION CHECKLIST
- [x] INT-1 merged and `pytest` green
- [x] `python scripts/smoke_test.py` shows all PASS
- [x] Every row in `docs/testing.md` is PASS or has an issue
- [x] `docker compose up --build` works from a clean clone
- [x] Refreshing `/chat` and `/study` works in Docker
- [x] README, `docs/api.md` and the context file agree
- [x] `v1.0.0` tag pushed
