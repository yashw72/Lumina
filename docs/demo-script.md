# DocuMentor AI: 5-Minute Faculty & Reviewer Demo Script

This script walks through a concise, 5-minute faculty presentation of **DocuMentor AI**, demonstrating the full RAG pipeline, interactive UI, study aids, and strict grounding without hallucinations.

---

## Demo Preparation
1. Start the stack: `docker compose up --build` or run locally (`uvicorn app.main:app` and `npm run dev`).
2. Open [http://localhost:5173](http://localhost:5173) in your browser.
3. Have the sample document ready: [`docs/sample/operating-systems-notes.md`](sample/operating-systems-notes.md).

---

## 1. Document Upload & Ingestion (Minute 0:00 – 1:00)
- **Action**: On the home page, drag & drop [`docs/sample/operating-systems-notes.md`](sample/operating-systems-notes.md) into the upload dropzone.
- **What to say**:
  > *"When a student uploads course material, DocuMentor AI immediately initiates a page-aware pipeline: it extracts text, strips formatting noise, splits content into semantic 800-character chunks with a 150-character overlap, and embeds them into high-dimensional vectors using local sentence-transformers stored in ChromaDB."*
- **Outcome**: The file card appears with a status of "Ready", showing page and chunk count.

---

## 2. Grounded RAG Chat & Source Citations (Minute 1:00 – 2:30)
Navigate to the **Chat** tab.

### Question 1 (Core Concept)
- **Ask**: `"What are the four Coffman conditions for a deadlock?"`
- **What to observe**: The response lists Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Under the answer, inspect the **Source Card** showing filename, page number, and exact text snippet.
- **What to say**:
  > *"Notice how the answer is strictly grounded in the uploaded material. Every claim is substantiated by a traceable source citation."*

### Question 2 (Specific Detail)
- **Ask**: `"What is the Banker's Algorithm used for?"`
- **What to observe**: The answer explains it is used for deadlock avoidance by verifying safe states.

### Question 3 (Follow-up Question)
- **Ask**: `"How does it ensure safety?"` *(< 6 words follow-up)*
- **What to observe**: The backend enriches the retrieval query with the previous turn to retrieve the correct context and answer smoothly.
- **What to say**:
  > *"Short conversational follow-ups are automatically synthesized with conversation history to maintain context without hallucinating."*

### Question 4 (Out-of-Scope / Anti-Hallucination Guardrail)
- **Ask**: `"What is the capital of Australia?"`
- **What to observe**:
  > *"I could not find this information in your uploaded documents."*
  *(Sources list is empty; zero hallucination).*
- **What to say**:
  > *"Unlike generic LLMs, our RAG guardrail measures cosine similarity confidence. When no chunks score above our threshold (0.25), the LLM generation is short-circuited entirely, preventing false claims."*

---

## 3. Automated Study Aids (Minute 2:30 – 4:00)
Navigate to the **Study** tab. Select `operating-systems-notes.md`.

1. **Executive Summary**:
   - Click **Generate Summary**.
   - Review structured Markdown sections: Key Concepts, Definitions, and Core Takeaways.
2. **Interactive Flashcards**:
   - Click **Flashcards** (set count to 10).
   - Flip cards with Spacebar / click; shuffle deck and navigate using arrow keys.
3. **Practice Quiz**:
   - Click **Quiz** (set count to 5).
   - Answer question 1: Observe instant green/red validation and explanatory feedback.
   - Complete quiz and observe the score summary screen.

---

## 4. Q&A and Faculty Defense (Minute 4:00 – 5:00)

### Expected Questions & Model Answers

**Q: Why use RAG instead of fine-tuning the model or using a larger context window?**  
> **A:** Fine-tuning teaches style, not verifiable facts, and easily hallucinates outdated facts. RAG is dynamic: students can add, update, or delete study files instantly without retraining. Context windows can suffer from "lost in the middle" and cost far more in latency and tokens. RAG gives us deterministic traceability back to page numbers.

**Q: Why ChromaDB?**  
> **A:** ChromaDB is an open-source, AI-native vector database that runs embedded and persistent locally. It requires zero cloud infrastructure, ensures zero privacy leakage of student documents, and supports metadata-based filtering by document ID.

**Q: How are hallucinations reduced?**  
> **A:** Through three layers:
> 1. Strict system prompting ("Answer ONLY from the provided context blocks").
> 2. Cosine similarity threshold guardrails (scores below 0.25 return not-found without calling the LLM).
> 3. Traceable source snippets returned alongside answers.

**Q: What is the chunk size and why?**  
> **A:** 800 characters with 150-character overlap. 800 characters corresponds to approximately 1–2 dense paragraphs, preserving coherent semantic concepts within the 384-dimensional space of `all-MiniLM-L6-v2`. Overlap prevents critical sentences from being split in half at chunk boundaries.
