import logging
from typing import List, Dict, Any
from app.services import vector_store, llm

logger = logging.getLogger("documentor.study_tools")


def get_document_text(document_id: int) -> str:
    """
    Fetches chunks for a document from ChromaDB ordered by chunk_index.
    If the text exceeds ~12,000 characters, samples chunks evenly to fit within token limits.
    """
    chunks = vector_store.get_document_chunks(document_id)
    if not chunks:
        raise ValueError(f"No indexed content found in vector store for document ID {document_id}.")

    full_texts = [c["text"] for c in chunks]
    total_len = sum(len(t) for t in full_texts)

    if total_len <= 12000:
        return "\n\n".join(full_texts)

    # Sample evenly spaced chunks
    logger.info(
        "Document id=%d text length (%d) exceeds 12000 chars; sampling evenly spaced chunks.",
        document_id,
        total_len,
    )
    avg_chunk_len = max(total_len / len(full_texts), 1)
    target_count = max(1, int(12000 / avg_chunk_len))
    step = max(1, len(full_texts) // target_count)

    sampled = full_texts[::step]
    combined = "\n\n".join(sampled)
    return combined[:12000]


def generate_summary(document_id: int) -> str:
    """Generates an educational Markdown summary (key concepts, definitions, takeaways)."""
    text = get_document_text(document_id)

    prompt = (
        f"Based on the following study document, create a comprehensive, well-structured study summary in Markdown.\n\n"
        f"Document Content:\n{text}\n\n"
        f"Please organize your summary with the following sections:\n"
        f"# Summary\n"
        f"## Key Concepts\n"
        f"## Definitions\n"
        f"## Core Takeaways\n\n"
        f"Use bullet points, concise explanations, and bold keywords where appropriate."
    )

    summary_md = llm.generate(
        prompt=prompt,
        system_instruction="You are an expert academic tutor creating structured study summaries.",
        temperature=0.2,
    )
    return summary_md


def generate_flashcards(document_id: int, count: int = 10) -> List[Dict[str, str]]:
    """Generates flashcards (question and answer) as a validated JSON list."""
    count = max(1, min(count, 20))
    text = get_document_text(document_id)

    prompt = (
        f"Generate {count} high-quality study flashcards based on the document below.\n\n"
        f"Document Content:\n{text}\n\n"
        f"Format the output strictly as a JSON list of objects:\n"
        f"[\n"
        f'  {{"question": "What is ...?", "answer": "..."}}\n'
        f"]"
    )

    parsed = llm.generate_json(
        prompt=prompt,
        system_instruction="You are an academic flashcard creator. Output only valid JSON with question and answer pairs.",
    )

    valid_flashcards: List[Dict[str, str]] = []
    if isinstance(parsed, list):
        for item in parsed:
            if isinstance(item, dict):
                q = item.get("question")
                a = item.get("answer")
                if isinstance(q, str) and isinstance(a, str) and q.strip() and a.strip():
                    valid_flashcards.append({"question": q.strip(), "answer": a.strip()})
            if len(valid_flashcards) >= count:
                break

    return valid_flashcards


def generate_quiz(document_id: int, count: int = 5) -> List[Dict[str, Any]]:
    """Generates multiple-choice quiz questions with 4 options and explanation."""
    count = max(1, min(count, 20))
    text = get_document_text(document_id)

    prompt = (
        f"Generate {count} multiple-choice quiz questions based on the document below.\n"
        f"Each question MUST contain exactly 4 answer options (index 0 to 3), the 0-based correct_index, and an explanation.\n\n"
        f"Document Content:\n{text}\n\n"
        f"Format strictly as a JSON list of objects:\n"
        f"[\n"
        f"  {{\n"
        f'    "question": "Which of the following ...?",\n'
        f'    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        f'    "correct_index": 1,\n'
        f'    "explanation": "Option B is correct because ..."\n'
        f"  }}\n"
        f"]"
    )

    parsed = llm.generate_json(
        prompt=prompt,
        system_instruction="You are an examination question creator. Produce valid multiple-choice quiz items in JSON.",
    )

    valid_quiz: List[Dict[str, Any]] = []
    if isinstance(parsed, list):
        for item in parsed:
            if isinstance(item, dict):
                q = item.get("question")
                opts = item.get("options")
                c_idx = item.get("correct_index")
                exp = item.get("explanation", "")

                if (
                    isinstance(q, str) and q.strip()
                    and isinstance(opts, list) and len(opts) == 4
                    and all(isinstance(o, str) and o.strip() for o in opts)
                    and isinstance(c_idx, int) and 0 <= c_idx <= 3
                    and isinstance(exp, str)
                ):
                    valid_quiz.append({
                        "question": q.strip(),
                        "options": [o.strip() for o in opts],
                        "correct_index": c_idx,
                        "explanation": exp.strip(),
                    })
            if len(valid_quiz) >= count:
                break

    return valid_quiz
