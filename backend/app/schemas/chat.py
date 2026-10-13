from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    document_ids: Optional[List[int]] = None
    session_id: Optional[str] = None


class Source(BaseModel):
    document_id: int
    filename: str
    page: int
    snippet: str
    score: float


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    sources: List[Source]


class ChatMessageHistory(BaseModel):
    role: str
    content: str
    sources: Optional[List[Source]] = None
    created_at: datetime


class HistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatMessageHistory]
