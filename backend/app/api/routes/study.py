from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Document
from app.schemas.study import (
    SummaryRequest,
    SummaryResponse,
    FlashcardRequest,
    FlashcardResponse,
    QuizRequest,
    QuizResponse,
)
from app.services.llm import LLMError
from app.services import study_tools

router = APIRouter(prefix="/study", tags=["Study Tools"])


def _get_ready_document(document_id: int, db: Session) -> Document:
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found.",
        )
    if doc.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document '{doc.filename}' is not ready yet (current status: {doc.status}).",
        )
    return doc


@router.post("/summary", response_model=SummaryResponse)
def get_summary(
    payload: SummaryRequest,
    db: Session = Depends(get_db),
):
    """Generates an educational summary for an ingested document."""
    _get_ready_document(payload.document_id, db)
    try:
        summary_text = study_tools.generate_summary(payload.document_id)
        return SummaryResponse(document_id=payload.document_id, summary=summary_text)
    except LLMError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI model service error while generating summary: {e.message}",
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.post("/flashcards", response_model=FlashcardResponse)
def get_flashcards(
    payload: FlashcardRequest,
    db: Session = Depends(get_db),
):
    """Generates flashcards for an ingested document."""
    _get_ready_document(payload.document_id, db)
    try:
        cards = study_tools.generate_flashcards(payload.document_id, count=payload.count or 10)
        return FlashcardResponse(document_id=payload.document_id, flashcards=cards)
    except LLMError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI model service error while generating flashcards: {e.message}",
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.post("/quiz", response_model=QuizResponse)
def get_quiz(
    payload: QuizRequest,
    db: Session = Depends(get_db),
):
    """Generates multiple-choice quiz questions for an ingested document."""
    _get_ready_document(payload.document_id, db)
    try:
        questions = study_tools.generate_quiz(payload.document_id, count=payload.count or 5)
        return QuizResponse(document_id=payload.document_id, questions=questions)
    except LLMError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI model service error while generating quiz: {e.message}",
        ) from e
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
