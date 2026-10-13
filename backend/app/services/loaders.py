import os
import re
from typing import List, Dict, Any


def clean_text(text: str) -> str:
    """Cleans raw text by stripping null bytes, normalizing newlines and collapsing whitespace."""
    if not text:
        return ""
    # Strip null characters
    text = text.replace("\x00", "")
    # Normalize carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse multiple consecutive horizontal spaces/tabs
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse 3 or more consecutive newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Strip each line and overall text
    lines = [line.strip() for line in text.split("\n")]
    text = "\n".join(lines)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def load_document(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """
    Loads text content from a document file.
    Returns a list of dicts: [{"page": int, "text": str}]
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = file_type.lower().strip().lstrip(".")
    supported = {"pdf", "docx", "txt", "md"}
    if ext not in supported:
        raise ValueError(
            f"Unsupported file type: '{file_type}'. Supported types are: {', '.join(sorted(supported))}."
        )

    pages: List[Dict[str, Any]] = []

    if ext == "pdf":
        import pypdf

        try:
            reader = pypdf.PdfReader(file_path)
            for idx, page in enumerate(reader.pages, start=1):
                raw = page.extract_text() or ""
                cleaned = clean_text(raw)
                if cleaned:
                    pages.append({"page": idx, "text": cleaned})
        except Exception as e:
            raise ValueError(f"Failed to read PDF file '{file_path}': {str(e)}") from e

    elif ext == "docx":
        import docx

        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            full_text = "\n\n".join(paragraphs)
            cleaned = clean_text(full_text)
            if cleaned:
                pages.append({"page": 1, "text": cleaned})
        except Exception as e:
            raise ValueError(f"Failed to read DOCX file '{file_path}': {str(e)}") from e

    elif ext in {"txt", "md"}:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()
            cleaned = clean_text(raw)
            if cleaned:
                pages.append({"page": 1, "text": cleaned})
        except Exception as e:
            raise ValueError(f"Failed to read text file '{file_path}': {str(e)}") from e

    if not pages:
        raise ValueError(
            f"No text could be extracted from '{os.path.basename(file_path)}'. "
            "Please ensure the document contains readable text and is not an empty or scanned document."
        )

    return pages
