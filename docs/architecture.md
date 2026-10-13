# Architecture & RAG Flow

## Overview
DocuMentor AI uses Retrieval-Augmented Generation (RAG) to ensure answers are strictly grounded in uploaded course and study material, preventing hallucinations and providing source citations.

---

## Backend Module Architecture

```
                    ┌────────────────────────────┐
                    │       FastAPI Routes       │
                    │ /health, /documents,       │
                    │ /chat, /study              │
                    └──────────────┬─────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
     ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
     │  app/db/        │  │  app/schemas/   │  │  app/services/  │
     │  - database.py  │  │  - document.py  │  │  (Business      │
     │  - models.py    │  │  - chat.py      │  │   Logic Layer)  │
     │  (SQLite/ORM)   │  │  - study.py     │  └────────┬────────┘
     └─────────────────┘  └─────────────────┘           │
                                                        │
          ┌─────────────────────────────────────────────┴───────────────────────┐
          │                                                                     │
          ▼                                                                     ▼
┌──────────────────┐                                                  ┌──────────────────┐
│ ChromaDB         │                                                  │ Google Gemini    │
│ (Persistent      │                                                  │ API (LLM)        │
│ Vector Store)    │                                                  └──────────────────┘
└──────────────────┘
```

---

## Services Layer (`backend/app/services/`)

Each service file has a single, well-defined responsibility:

1. **`loaders.py`**
   - Extracts page-by-page text from multi-format files (`.pdf`, `.docx`, `.txt`, `.md`).
   - Uses `pypdf` for page-aware PDF extraction and `python-docx` for document structure.
   - Cleans raw text: removes null characters, normalizes line breaks, and collapses extraneous whitespace.

2. **`chunker.py`**
   - Splits extracted text into character-bounded chunks with a sliding overlap (`CHUNK_SIZE`, `CHUNK_OVERLAP`).
   - Respects natural paragraph and sentence delimiters (`\n\n`, `. `, `? `, `! `) to avoid cutting words or clauses in half.
   - Enforces page-boundary isolation: chunks never cross page boundaries so source citations always point to a unique, correct page number.
   - Assigns unique, monotonic `chunk_index` identifiers across the document and filters out fragments under 30 characters.

3. **`embeddings.py`**
   - Wraps `sentence-transformers` (`all-MiniLM-L6-v2`) with lazy, singleton model loading.
   - Computes normalized vector embeddings for document chunks (`embed_texts`) and queries (`embed_query`).

4. **`vector_store.py`**
   - Wraps ChromaDB's persistent client (`chromadb.PersistentClient`) with cosine similarity.
   - Handles vector indexing (`add_chunks`), similarity search with document filtering (`query`), and document chunk deletion (`delete_document`).

5. **`ingestion.py`**
   - Orchestrates the full document ingestion lifecycle: extraction -> chunking -> vector embedding -> database metadata update.
   - Handles error rollbacks and sets document status to `"ready"` or `"failed"`.

6. **`llm.py`**
   - Thin, isolated client wrapper around Google Gemini (`google-genai` SDK).
   - Exposes `generate()` for text generation and `generate_json()` with retry and markdown fence stripping for structured output.
   - Translates API errors into structured `LLMError` exceptions.

7. **`rag.py`**
   - Implements the complete chat RAG workflow:
     1. Records user message in chat session.
     2. Searches ChromaDB for relevant context chunks.
     3. Checks confidence guardrail (`score < 0.25`); if insufficient, returns a standard "not found" answer without calling the LLM.
     4. Constructs context-grounded prompts with recent chat history and strict instructions preventing hallucination.
     5. Saves assistant message with deduplicated source citations.

8. **`study_tools.py`**
   - Generates educational study aids from ingested documents:
     - `generate_summary`: Structured markdown summary (key concepts, definitions, takeaways).
     - `generate_flashcards`: Question-and-answer pairs validated from JSON.
     - `generate_quiz`: Multiple-choice questions with 4 options, 0-indexed correct answer, and explanation.

---

## Complete RAG Data Flow

### 1. Document Upload & Ingestion
```
[User Uploads File] (PDF / DOCX / TXT / MD)
       │
       ▼
[Extract Text (per page)] (loaders.py)
       │
       ▼
[Clean Text] (loaders.clean_text)
       │
       ▼
[Chunk Text] (chunker.py: size=800, overlap=150)
       │
       ▼
[Generate Embeddings] (embeddings.py: all-MiniLM-L6-v2)
       │
       ├──────────────────────────────┐
       ▼                              ▼
[Store Vectors in ChromaDB]   [Store Metadata in SQLite]
 (vector_store.py)              (models.Document: status="ready")
```

### 2. Retrieval & Question Answering
```
[User Question]
       │
       ▼
[Embed Question] (embeddings.embed_query)
       │
       ▼
[Vector Similarity Search in ChromaDB] (vector_store.query)
       │
       ├── [Best Score < 0.25?] ──► Return "Not found in documents" (No LLM call)
       │
       ▼ (Best Score >= 0.25)
[Build Prompt with Context + History] (rag.py)
       │
       ▼
[LLM Generation] (llm.generate via Gemini API)
       │
       ▼
[Response to User] (Grounded Answer + Deduplicated Sources)
```
