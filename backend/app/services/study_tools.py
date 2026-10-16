import logging
from typing import List, Dict, Any, Optional
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


def _extract_list_from_json(parsed: Any) -> List[Any]:
    """Extracts a list from JSON even if wrapped in a dictionary envelope."""
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        for key in ["flashcards", "cards", "questions", "quiz", "items", "data", "results", "deck"]:
            if key in parsed and isinstance(parsed[key], list):
                return parsed[key]
        for v in parsed.values():
            if isinstance(v, list):
                return v
        if parsed and all(isinstance(v, dict) for v in parsed.values()):
            return list(parsed.values())
    return []


def _extract_card_pair(item: Any) -> Optional[Dict[str, str]]:
    """Extracts question and answer safely regardless of key casing or variation."""
    if not isinstance(item, dict):
        return None
    lower_map = {str(k).lower().strip(): v for k, v in item.items()}
    q = (
        lower_map.get("question")
        or lower_map.get("q")
        or lower_map.get("front")
        or lower_map.get("prompt")
        or lower_map.get("term")
        or lower_map.get("concept")
    )
    a = (
        lower_map.get("answer")
        or lower_map.get("a")
        or lower_map.get("back")
        or lower_map.get("definition")
        or lower_map.get("explanation")
        or lower_map.get("solution")
    )
    if isinstance(q, str) and isinstance(a, str) and q.strip() and a.strip():
        return {"question": q.strip(), "answer": a.strip()}
    return None


def generate_flashcards(document_id: int, count: int = 10) -> List[Dict[str, str]]:
    """Generates flashcards (question and answer) as a validated JSON list with multi-layer fallback."""
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

    try:
        parsed = llm.generate_json(
            prompt=prompt,
            system_instruction="You are an academic flashcard creator. Output only valid JSON with question and answer pairs.",
        )
    except Exception as e:
        logger.warning("generate_json failed for flashcards: %s. Attempting fallback...", str(e))
        parsed = []

    valid_flashcards: List[Dict[str, str]] = []
    items = _extract_list_from_json(parsed)
    for item in items:
        card = _extract_card_pair(item)
        if card:
            valid_flashcards.append(card)
        if len(valid_flashcards) >= count:
            break

    # Robust Fallback: Text generation with regex if JSON parsing yielded no items
    if not valid_flashcards:
        logger.info("JSON flashcards empty for doc id=%d. Executing text regex fallback.", document_id)
        raw_prompt = (
            f"Generate {count} educational study flashcards based on this document:\n{text}\n\n"
            f"Format each card exactly like this:\n"
            f"Q: Question here?\n"
            f"A: Answer here.\n"
            f"---\n"
        )
        try:
            import re
            raw_text = llm.generate(raw_prompt, temperature=0.3)
            matches = re.findall(
                r"(?:Q|Question)\s*:\s*(.+?)\n+(?:A|Answer)\s*:\s*(.+?)(?=(?:\n+---|\n+(?:Q|Question)\s*:|\Z))",
                raw_text,
                re.DOTALL | re.IGNORECASE,
            )
            for q, a in matches:
                clean_q = q.strip().strip("- ")
                clean_a = a.strip().strip("- ")
                if clean_q and clean_a:
                    valid_flashcards.append({"question": clean_q, "answer": clean_a})
                if len(valid_flashcards) >= count:
                    break
        except Exception as e:
            logger.error("Text fallback for flashcards failed: %s", str(e))

    if not valid_flashcards:
        raise llm.LLMError(
            f"Failed to generate flashcards from document ID {document_id}. Please try again.",
            status_code=502,
        )

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

    try:
        parsed = llm.generate_json(
            prompt=prompt,
            system_instruction="You are an examination question creator. Produce valid multiple-choice quiz items in JSON.",
        )
    except Exception as e:
        logger.warning("generate_json failed for quiz: %s. Attempting fallback...", str(e))
        parsed = []

    valid_quiz: List[Dict[str, Any]] = []
    items = _extract_list_from_json(parsed)
    for item in items:
        if isinstance(item, dict):
            lower_map = {str(k).lower().strip(): v for k, v in item.items()}
            q = lower_map.get("question") or lower_map.get("prompt")
            opts = lower_map.get("options") or lower_map.get("choices")
            c_idx = lower_map.get("correct_index")
            if c_idx is None:
                c_idx = lower_map.get("correct_answer") or lower_map.get("answer")
            exp = lower_map.get("explanation", "")

            # If correct_index is a letter (e.g. "A", "B", "C", "D") or matching option string
            if isinstance(c_idx, str):
                c_idx_str = c_idx.strip().upper()
                letter_map = {"A": 0, "B": 1, "C": 2, "D": 3}
                if c_idx_str in letter_map:
                    c_idx = letter_map[c_idx_str]
                elif isinstance(opts, list) and c_idx in opts:
                    c_idx = opts.index(c_idx)

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

    if not valid_quiz:
        raise llm.LLMError(
            f"Failed to generate practice quiz for document ID {document_id}. Please try again.",
            status_code=502,
        )

    return valid_quiz
