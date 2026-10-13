# Architecture & RAG Flow

## Overview
DocuMentor AI uses Retrieval-Augmented Generation (RAG) to ensure answers are strictly grounded in uploaded course and study material, preventing hallucinations and providing source citations.

## RAG Flow

### 1. Document Upload & Ingestion
```
[User Uploads File] (PDF / DOCX / TXT / MD)
       │
       ▼
[Extract Text (per page)]
       │
       ▼
[Clean Text]
       │
       ▼
[Chunk Text] (size=800, overlap=150)
       │
       ▼
[Generate Embeddings] (sentence-transformers: all-MiniLM-L6-v2)
       │
       ├──────────────────────────────┐
       ▼                              ▼
[Store Vectors in ChromaDB]   [Store Metadata in SQLite]
 (embeddings + chunk text)      (Document id, status, etc.)
```

### 2. Retrieval & Question Answering
```
[User Question]
       │
       ▼
[Embed Question] (sentence-transformers: all-MiniLM-L6-v2)
       │
       ▼
[Vector Similarity Search in ChromaDB] (retrieve top-K chunks)
       │
       ▼
[Build Prompt] (Context Chunks + Question + Strict Guardrails)
       │
       ▼
[LLM Generation] (Google Gemini API)
       │
       ▼
[Response to User] (Grounded Answer + Source Citations)
```

### High-Level Summary
```
UPLOAD:  file -> extract text (per page) -> clean -> chunk -> embed -> store in ChromaDB (+ metadata in SQLite)
ASK:     question -> embed -> top-K similar chunks from ChromaDB -> build prompt (context + question) -> LLM -> answer + sources
```
