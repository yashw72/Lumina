from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Document, User
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
from app.api.deps import get_current_user

router = APIRouter(
    prefix="/study",
    tags=["Study Tools"],
    dependencies=[Depends(get_current_user)],
)


def _get_ready_document(document_id: int, user_id: int, db: Session) -> Document:
    """
    Retrieves document belonging to current user with ready status.
    Returns 404 if document does not belong to user or is not ready.
    """
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == user_id)
        .first()
    )
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found.",
        )
    if doc.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} is not ready (status: {doc.status}).",
        )
    return doc


@router.post("/summary", response_model=SummaryResponse)
def get_summary(
    payload: SummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates an educational summary for an ingested document owned by current user."""
    _get_ready_document(payload.document_id, current_user.id, db)
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
    current_user: User = Depends(get_current_user),
):
    """Generates flashcards for an ingested document owned by current user."""
    _get_ready_document(payload.document_id, current_user.id, db)
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
    current_user: User = Depends(get_current_user),
):
    """Generates multiple-choice quiz questions for an ingested document owned by current user."""
    _get_ready_document(payload.document_id, current_user.id, db)
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
