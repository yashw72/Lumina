import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    HistoryResponse,
    ChatMessageHistory,
    Source,
)
from app.services.rag import answer_question

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def chat_with_documents(
    payload: ChatRequest,
    db: Session = Depends(get_db),
):
    """Answers a user question grounded strictly in uploaded documents."""
    return answer_question(
        db=db,
        question=payload.question,
        document_ids=payload.document_ids,
        session_id=payload.session_id,
    )


@router.get("/history/{session_id}", response_model=HistoryResponse)
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
):
    """Retrieves conversation history and sources for a given chat session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
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
                created_at=msg.created_at,
            )
        )

    return HistoryResponse(session_id=session_id, messages=history)
