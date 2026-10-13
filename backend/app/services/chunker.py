from typing import List, Dict, Any, Optional
from app.core.config import get_settings


def _split_text_with_overlap(text: str, chunk_size: int, overlap: int) -> List[str]:
    """Splits a single page text into overlapping chunks, respecting sentence/paragraph boundaries when possible."""
    if not text:
        return []

    text = text.strip()
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        if end >= text_len:
            tail = text[start:].strip()
            if tail:
                chunks.append(tail)
            break

        # Look for natural split boundary within the last portion of chunk
        min_split_point = max(start + (chunk_size // 2), start + 1)

        best_split = -1
        # 1. Paragraph boundary
        p_idx = text.rfind("\n\n", min_split_point, end)
        if p_idx != -1:
            best_split = p_idx + 2
        else:
            # 2. Sentence boundary
            for delimiter in [". ", ".\n", "!\n", "?\n", "! ", "? ", "\n"]:
                d_idx = text.rfind(delimiter, min_split_point, end)
                if d_idx != -1:
                    best_split = d_idx + len(delimiter)
                    break

        if best_split == -1:
            # 3. Word boundary
            space_idx = text.rfind(" ", min_split_point, end)
            if space_idx != -1:
                best_split = space_idx + 1
            else:
                best_split = end

        chunk = text[start:best_split].strip()
        if chunk:
            chunks.append(chunk)

        # Advance start index accounting for overlap
        next_start = best_split - overlap
        if next_start <= start:
            next_start = best_split
        start = next_start

    return chunks


def chunk_pages(
    pages: List[Dict[str, Any]],
    chunk_size: Optional[int] = None,
    overlap: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Chunks a list of page dictionaries into character-bounded chunks with overlap.
    Preserves page boundaries and assigns unique sequential chunk_index.
    Skips chunks shorter than 30 characters.
    """
    settings = get_settings()
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE
    if overlap is None:
        overlap = settings.CHUNK_OVERLAP

    if overlap >= chunk_size:
        overlap = max(0, chunk_size // 4)

    all_chunks: List[Dict[str, Any]] = []
    chunk_index = 0

    for page_item in pages:
        page_num = page_item["page"]
        text = page_item.get("text", "")

        page_chunks = _split_text_with_overlap(text, chunk_size, overlap)

        for chunk_text in page_chunks:
            # Skip chunks shorter than 30 characters
            if len(chunk_text) < 30:
                continue

            all_chunks.append({
                "text": chunk_text,
                "page": page_num,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

    return all_chunks
