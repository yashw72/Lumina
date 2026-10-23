import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ChatSession, ChatMessage, Document, User
from app.schemas.chat import (
    ChatRequest,
    ImageChatRequest,
    ChatResponse,
    HistoryResponse,
    ChatMessageHistory,
    Source,
)
from app.services.rag import answer_question
from app.api.deps import get_current_user

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", response_model=ChatResponse)
def chat_with_documents(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Answers a user question grounded strictly in uploaded documents."""
    clean_question = payload.question.strip()
    if not clean_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty or only whitespace.",
        )

    return answer_question(
        db=db,
        question=clean_question,
        document_ids=payload.document_ids,
        session_id=payload.session_id,
        is_image=bool(payload.is_image),
        user_id=current_user.id,
    )


@router.post("/image", response_model=ChatResponse)
def generate_chat_image(
    payload: ImageChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generates an educational concept diagram / image with RAG context."""
    clean_prompt = payload.prompt.strip()
    if not clean_prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty or only whitespace.",
        )

    return answer_question(
        db=db,
        question=clean_prompt,
        document_ids=payload.document_ids,
        session_id=payload.session_id,
        is_image=True,
        user_id=current_user.id,
    )


@router.get("/history/{session_id}", response_model=HistoryResponse)
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves conversation history and sources for a given chat session owned by current user."""
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with ID '{session_id}' not found.",
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    history = []
    for msg in messages:
        sources_list = None
        if msg.sources_json:
            try:
                raw_sources = json.loads(msg.sources_json)
                sources_list = [Source(**s) for s in raw_sources]
            except Exception:
                sources_list = []

        history.append(
            ChatMessageHistory(
                role=msg.role,
                content=msg.content,
                sources=sources_list,
                image_url=msg.image_url,
                created_at=msg.created_at,
            )
        )

    return HistoryResponse(session_id=session_id, messages=history)
