from typing import List, Optional
from pydantic import BaseModel, Field


# --- Summary ---
class SummaryRequest(BaseModel):
    document_id: int


class SummaryResponse(BaseModel):
    document_id: int
    summary: str


# --- Flashcards ---
class FlashcardRequest(BaseModel):
    document_id: int
    count: Optional[int] = Field(default=10, ge=1, le=20)


class FlashcardItem(BaseModel):
    question: str
    answer: str


class FlashcardResponse(BaseModel):
    document_id: int
    flashcards: List[FlashcardItem]


# --- Quiz ---
class QuizRequest(BaseModel):
    document_id: int
    count: Optional[int] = Field(default=5, ge=1, le=20)


class QuizQuestion(BaseModel):
    question: str
    options: List[str] = Field(..., min_length=4, max_length=4)
    correct_index: int = Field(..., ge=0, le=3)
    explanation: str


class QuizResponse(BaseModel):
    document_id: int
    questions: List[QuizQuestion]
