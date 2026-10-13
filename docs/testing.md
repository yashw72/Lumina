# Manual End-to-End Integration Testing Checklist

This checklist defines the manual validation suite for **DocuMentor AI**, verifying end-to-end user workflows across document ingestion, RAG chat, study aids, error conditions, and responsive UI.

---

## Test Cases

| ID | Area | Steps | Expected | Result |
|---|---|---|---|---|
| **UP-01** | Upload | Drag & drop a standard `.pdf` document (~2MB) | Upload succeeds with 100% progress; status shows "ready" with page and chunk count. | PASS |
| **UP-02** | Upload | Upload a `.docx` syllabus file | File is parsed, paragraphs joined, chunked, and marked "ready". | PASS |
| **UP-03** | Upload | Upload a standard `.txt` notes file | Upload succeeds, marked "ready". | PASS |
| **UP-04** | Upload | Upload a `.md` markdown file | Upload succeeds, marked "ready". | PASS |
| **UP-05** | Upload | Attempt to upload a 25 MB file | Rejected with 413 error toast: "File exceeds maximum size limit of 20MB." | PASS |
| **UP-06** | Upload | Attempt to upload a `.png` or unsupported file | Form validation rejects file with toast: "Only .pdf, .docx, .txt, .md supported." | PASS |
| **UP-07** | Upload | Upload a 0-byte empty file | Rejected with 400 error toast: "Uploaded file is empty." | PASS |
| **UP-08** | Upload | Upload an image-only scanned PDF | Rejected with descriptive error indicating no extractable text found. | PASS |
| **UP-09** | Upload | Upload the same document twice | Both uploads succeed with unique server paths and individual document IDs. | PASS |
| **UP-10** | Upload | Drag & drop file onto upload drop zone | Drop zone triggers visual focus/active ring and initiates upload on release. | PASS |
| **UP-11** | Upload | Cancel upload by closing modal or navigating away | In-flight request aborted cleanly without unmounted state update errors. | PASS |
| **LIB-01** | Library | View uploaded document card in library | Card displays filename, file type badge, page count, chunk count, and date. | PASS |
| **LIB-02** | Library | Observe processing document status badge | Shows animated amber "Processing" badge until ingestion finishes as "Ready". | PASS |
| **LIB-03** | Library | Delete a document | Confirmation prompt appears; on confirm, deleted from DB, disk, and vector store. | PASS |
| **LIB-04** | Library | Delete all documents and view library | Clean EmptyState illustration rendered with "No documents found" call to action. | PASS |
| **LIB-05** | Library | Refresh browser on library page | All uploaded documents persist and display accurately. | PASS |
| **CHT-01** | Chat | Ask a question answered directly in the document | Grounded answer generated with clickable/collapsible source cards showing page & snippet. | PASS |
| **CHT-02** | Chat | Ask an unrelated question (e.g. "What is the capital of Mars?") | Assistant clearly states information was not found in documents; sources list is empty. | PASS |
| **CHT-03** | Chat | Ask a follow-up question ("Why does that happen?") | Follow-up context is enriched from previous query; conversation history preserved. | PASS |
| **CHT-04** | Chat | Select 1 of 2 documents in sidebar filter | Sources cited strictly originate from the selected document only. | PASS |
| **CHT-05** | Chat | Inspect source citation snippet and page number | Snippet corresponds accurately to the cited page in the source document. | PASS |
| **CHT-06** | Chat | Click "Copy" button on assistant answer | Answer markdown copied to system clipboard with visual confirmation. | PASS |
| **CHT-07** | Chat | Press `Enter` vs `Shift+Enter` in chat input | `Enter` sends message; `Shift+Enter` inserts newline without sending. | PASS |
| **CHT-08** | Chat | Refresh browser during chat | Session ID and chat history restored from `localStorage` seamlessly. | PASS |
| **CHT-09** | Chat | Click "New Chat" button | Chat session reset, messages cleared, storage cleared, ready for fresh conversation. | PASS |
| **STD-01** | Study | Request Document Summary | Structured markdown summary generated with Key Concepts, Definitions, and Takeaways. | PASS |
| **STD-02** | Study | Generate 5, 10, and 15 Flashcards | Generates exact requested count; questions and answers populated correctly. | PASS |
| **STD-03** | Study | Flip and navigate Flashcards | Spacebar or click flips card; Left/Right arrow keys navigate next/previous cards. | PASS |
| **STD-04** | Study | Shuffle flashcard deck | Deck ordering is randomized; card count and position indicators update. | PASS |
| **STD-05** | Study | Generate multiple-choice Quiz (5 questions) | Each question renders exactly 4 distinct choices and explanations. | PASS |
| **STD-06** | Study | Complete quiz and view results | Instant green/red answer highlighting; final screen displays percentage and feedback. | PASS |
| **STD-07** | Study | Regenerate study materials | Re-triggers generation pipeline with fresh outputs. | PASS |
| **ERR-01** | Failures | Stop backend server while frontend is open | Amber/Red `BackendBanner` slides in at top with "Backend is not reachable" and Retry button. | PASS |
| **ERR-02** | Failures | Invalid or missing Gemini API key | Clear, non-technical error toast appears (e.g., "AI service error") with 502 status. | PASS |
| **ERR-03** | Failures | Slow network request | Clean loading spinners; timeout displays friendly "taking longer than usual" message. | PASS |
| **ERR-04** | Failures | Delete document while selected in active chat | Selection safely deselects document and falls back to "All Documents" without 404 crash. | PASS |
| **UI-01** | Interface | Responsive layout on Mobile (390px) | Navigation collapses into drawer/tabs; chat cards and buttons stack cleanly. | PASS |
| **UI-02** | Interface | Responsive layout on Tablet (768px) | Sidebar collapsable; study grid and document cards display comfortably. | PASS |
| **UI-03** | Interface | Responsive layout on Desktop (1440px) | Full 3-column layout where applicable; optimal line length and spacing. | PASS |
| **UI-04** | Interface | Dark mode toggle | Theme switches instantly between light and dark modes, persisting in `localStorage`. | PASS |
| **UI-05** | Interface | Keyboard-only navigation | All interactive buttons, cards, and inputs are focusable with visible focus rings. | PASS |

---

## How to Report a Bug
If any check fails:
1. Note the **Test Case ID** (e.g. `UP-05` or `CHT-03`).
2. Open the browser Developer Tools Console (`F12`) and backend server logs to capture the error stack trace or response payload.
3. Check whether the issue belongs to backend logic (`backend/app/...`) or frontend rendering (`frontend/src/...`).
4. File a GitHub Issue with reproduction steps, expected vs. actual results, and relevant log snippets.
