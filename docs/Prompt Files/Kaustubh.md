# Kaustubh.md — Frontend and UX Prompts (DocuMentor AI)

**Your role:** Frontend UI, API integration, UX and polish.
**Your folder:** `frontend/` only.

## How to use this file
1. Wait for Yash to push **his Chunk 1** (repo bootstrap) to GitHub, then clone the repo. `antigravitycontext.md` will already be in the root.
2. Paste ONE chunk's prompt into Antigravity at a time. Wait until it finishes and test the result in the browser.
3. Run the **Check** step. If it works, run the **Commit** commands.
4. Move to the next chunk. Do not skip chunks.
5. Work on a feature branch and open a PR to `main` after every 2-3 chunks.

> Chunks 1-6 can be built with **mock data**, so you do not need to wait for the backend. Real integration happens in Chunk 9.

---

## CHUNK 1 — Frontend scaffold (Vite + React + Tailwind)

**Prompt**
```text
Read antigravitycontext.md fully first. Work only inside frontend/.

Task: Scaffold the frontend.
1. Create a Vite + React (JavaScript) app inside frontend/ (the folder already exists with placeholder files; keep the structure from section 4 of the context file).
2. Install and configure: tailwindcss (with the Vite plugin or PostCSS setup that matches the current Tailwind version), react-router-dom, axios, react-hot-toast, lucide-react, react-markdown.
3. Create the folders: src/api, src/components/{layout,documents,chat,study,common}, src/pages, src/hooks, src/styles.
4. src/App.jsx: set up react-router-dom with routes "/" (HomePage), "/chat" (ChatPage), "/study" (StudyPage). Each page can just show a heading for now. Add the Toaster from react-hot-toast.
5. Make sure frontend/.env.example has VITE_API_BASE_URL=http://localhost:8000 and that npm run dev works on port 5173.
Give me the exact commands to install and run.
```

**Check:** `npm install && npm run dev` — the three routes open without errors.

**Commit**
```bash
git checkout -b feat/frontend-foundation
git add frontend/
git commit -m "feat(frontend): scaffold Vite React app with Tailwind and routing"
```

---

## CHUNK 2 — API client layer with mock mode

**Prompt**
```text
Read antigravitycontext.md first (especially section 6, the API contract). Work only inside frontend/.

Task: Build the API layer in src/api/.
1. client.js: an axios instance with baseURL = import.meta.env.VITE_API_BASE_URL + "/api" and a response interceptor that converts errors into an Error whose message is response.data.detail (or a friendly fallback like "Cannot reach the server").
2. documents.js: uploadDocument(file, onProgress), listDocuments(), deleteDocument(id).
3. chat.js: sendMessage({question, documentIds, sessionId}), getHistory(sessionId).
4. study.js: getSummary(documentId), getFlashcards(documentId, count), getQuiz(documentId, count).
5. All function names, request bodies and return shapes must match the API contract exactly. Convert the camelCase arguments to the snake_case JSON fields the backend expects (document_ids, session_id, document_id).
6. Add src/api/mock.js with realistic mock responses for every endpoint, and a flag VITE_USE_MOCK=true (add it to .env.example) so each API function returns mock data after a short fake delay when the flag is on. This lets me build the UI before the backend is ready.
```

**Check:** In the browser console, import one function and confirm it returns mock data.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add API client layer matching backend contract with mock mode"
```

---

## CHUNK 3 — App layout and common components

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Build the shell UI with Tailwind.
1. src/components/common: Button.jsx (variants: primary, secondary, danger; loading state), Loader.jsx (spinner), EmptyState.jsx (icon, title, description, optional action).
2. src/components/layout: Navbar.jsx (logo "DocuMentor AI", links to Home / Chat / Study, active link highlight) and a Layout wrapper with a centered max-width container.
3. Wrap all routes in the Layout in App.jsx.
4. Design direction: clean modern learning-app look — indigo primary color, soft gray background, rounded cards with subtle shadows, readable typography, fully responsive (mobile navbar can be a simple collapsed menu).
Use lucide-react icons. Keep components small and reusable.
```

**Check:** Navigate between pages; check the layout at mobile width.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add layout, navbar and reusable UI components"
```

---

## CHUNK 4 — Document upload component

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Build document upload.
1. src/components/documents/UploadBox.jsx: a drag-and-drop zone plus a "Browse files" button. Accept only .pdf, .docx, .txt, .md and a maximum of 20 MB (validate on the client and show a toast for invalid files).
2. Show an upload progress bar using the onProgress callback from api/documents.js, and a "Processing document..." state after the upload reaches 100% (the backend is chunking and embedding at that point).
3. On success show a success toast and call an onUploaded callback prop; on failure show the error toast.
4. src/hooks/useDocuments.js: a hook that loads documents with listDocuments, exposes {documents, loading, error, refresh, remove} and handles delete via deleteDocument.
5. Use UploadBox on HomePage.jsx (the hook's refresh runs after a successful upload).
```

**Check:** Upload a file with mock mode on; the progress bar and toasts show.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add drag-and-drop document upload with progress and validation"
```

---

## CHUNK 5 — Document library

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Build the document library on HomePage.
1. src/components/documents/DocumentCard.jsx: shows file-type icon, filename, page count, chunk count, status badge (ready = green, processing = yellow, failed = red), formatted upload date, and buttons: "Chat" (navigates to /chat?doc=<id>), "Study" (navigates to /study?doc=<id>) and "Delete" (with a confirmation dialog before calling remove).
2. src/components/documents/DocumentList.jsx: responsive grid of DocumentCards, a skeleton/Loader while loading, and EmptyState ("Upload your first document to get started") when there are none.
3. Update HomePage.jsx: hero section with a short description of DocuMentor AI, the UploadBox, then the DocumentList.
```

**Check:** Upload mock docs, delete one, test the empty state.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add document library with cards, delete confirmation and empty state"
```
> Open a PR for chunks 1-5 and ask Yash to review.

---

## CHUNK 6 — Chat UI

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Build the chat experience.
1. src/hooks/useChat.js: manages {messages, sending, sessionId, send(question)}. It calls sendMessage from api/chat.js with the selected document ids and the current sessionId, stores the returned session_id, and appends the user message immediately and the assistant message when the response arrives. Show an error toast on failure and keep the user message.
2. src/components/chat/MessageBubble.jsx: user messages on the right (indigo), assistant messages on the left (white card) rendered with react-markdown. Add a copy button on assistant messages.
3. src/components/chat/ChatInput.jsx: textarea that sends on Enter (Shift+Enter = new line), disabled while sending, with a send button.
4. src/components/chat/ChatWindow.jsx: scrollable message list that auto-scrolls to the newest message, a typing indicator ("DocuMentor is thinking...") while waiting, and suggested starter questions in an empty state.
5. src/pages/ChatPage.jsx: a left side panel with a checkbox list of the user's documents (status ready only) to choose which documents to search ("All documents" by default; preselect the doc from the ?doc= query param), and the ChatWindow on the right. On mobile the panel collapses.
```

**Check:** Chat with mock responses; scrolling, typing indicator and document selection work.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add chat interface with document selection and markdown answers"
```

---

## CHUNK 7 — Source citations

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Show where answers come from.
1. src/components/chat/SourceCard.jsx: a compact card showing filename, "Page N", a relevance score as a small percentage badge (score * 100, rounded) and the snippet text (clamped to 3 lines with an expand/collapse toggle).
2. In MessageBubble.jsx, below each assistant answer that has sources, render a collapsible "Sources (N)" section listing SourceCards (collapsed by default).
3. If an assistant message has an empty sources array, show a small muted note: "No matching content found in your documents."
4. Make sure it looks good on mobile and that long filenames truncate nicely.
```

**Check:** Mock answers show collapsible sources with page numbers.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add collapsible source citations to chat answers"
```

---

## CHUNK 8 — Study tools UI (summary, flashcards, quiz)

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Build the Study page.
1. src/pages/StudyPage.jsx: a document dropdown (ready documents only; preselect from the ?doc= query param) and three tabs: Summary, Flashcards, Quiz. Each tab has a "Generate" button, a loading state (generation can take 10-20 seconds, so show a friendly message), error toast, and an option to regenerate.
2. src/components/study/SummaryPanel.jsx: renders the markdown summary with react-markdown in a nicely styled prose card, with a "Copy" button.
3. src/components/study/FlashcardDeck.jsx: shows one flashcard at a time with a click-to-flip animation (question front, answer back), Previous/Next buttons, a "card 3 of 10" counter and a shuffle button.
4. src/components/study/QuizPanel.jsx: shows one multiple-choice question at a time; after the user picks an option, reveal correct/incorrect (green/red) with the explanation; keep score; at the end show a result screen with the score and a "Try again" button.
5. Allow choosing the number of flashcards (5/10/15) and quiz questions (5/10).
```

**Check:** All three tabs work end to end with mock data.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): add study page with summary, flip flashcards and interactive quiz"
```

---

## CHUNK 9 — Connect to the real backend

> Start this only after Yash confirms the backend PRs for upload, chat and study are merged. Pull `main` first.

**Prompt**
```text
Read antigravitycontext.md first. Work only inside frontend/.

Task: Switch the app from mock data to the real backend and fix integration issues.
1. Set VITE_USE_MOCK=false in my local .env (keep the flag in .env.example documented, defaulting to false).
2. Test and fix every flow against the real API at http://localhost:8000: upload, list, delete, chat (with and without selected documents, continuing the same session), summary, flashcards, quiz.
3. Handle real-world cases: very slow responses (timeouts up to 60 seconds for study tools and upload), network errors, 400/404/422/502 error messages from the backend shown in toasts, documents with status "failed", and the case when the backend is not running (show a banner "Backend is not reachable").
4. Disable chat and study actions for documents that are not "ready".
5. Check for CORS problems and tell me exactly what to change if any appear (do not edit backend files).
Summarize what you changed.
```

**Check:** Full flow: upload a real PDF -> ask questions -> view sources -> generate flashcards and a quiz.

**Commit**
```bash
git add frontend/
git commit -m "feat(frontend): integrate with real backend and improve error handling"
```

---

## CHUNK 10 — Polish, accessibility and docs

**Prompt**
```text
Read antigravitycontext.md first.

Task: Final polish and documentation for the frontend.
1. Add a dark mode toggle (Tailwind dark class, saved in localStorage) in the Navbar.
2. Accessibility pass: aria-labels on icon buttons, visible focus states, keyboard-friendly flashcards and quiz, good color contrast.
3. Add a frontend/Dockerfile (multi-stage: build with node, serve with nginx) and complete the frontend service in the root docker-compose.yml (port 5173 or 80 mapped sensibly, build arg for VITE_API_BASE_URL).
4. Update README.md: add a "Frontend setup" section (install, env, run, build), a "Features" list, and a "Screenshots" section with placeholders (I will add real screenshots).
5. Remove unused imports/components and run npm run build to make sure it succeeds.
```

**Check:** `npm run build` succeeds; dark mode persists after refresh.

**Commit**
```bash
git add .
git commit -m "feat(frontend): add dark mode, accessibility improvements, Dockerfile and docs"
git push origin feat/frontend-foundation
```

---

## FINAL CHECKLIST (Kaustubh)
- [ ] All pages work on desktop and mobile
- [ ] Loading, error and empty states exist everywhere
- [ ] `VITE_USE_MOCK=false` works against the real backend
- [ ] `npm run build` passes
- [ ] README has screenshots
- [ ] PRs reviewed and merged by Yash
