from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    id: int
    filename: str
    file_type: str
    page_count: int
    chunk_count: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentListOut(BaseModel):
    documents: List[DocumentOut]
