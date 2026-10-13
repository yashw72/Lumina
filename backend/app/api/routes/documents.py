import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db
from app.db.models import Document
from app.schemas.document import DocumentOut, DocumentListOut
from app.services.ingestion import ingest_document
from app.services import vector_store

router = APIRouter(prefix="/documents", tags=["Documents"])
settings = get_settings()

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "md"}


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Uploads a document (PDF, DOCX, TXT, MD), saves it, and indexes it into ChromaDB.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename cannot be empty.",
        )

    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: '.{ext}'. Allowed types are: {', '.join(sorted(ALLOWED_EXTENSIONS))}.",
        )

    # Validate file size
    max_bytes = settings.MAX_FILE_MB * 1024 * 1024
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size limit of {settings.MAX_FILE_MB}MB.",
        )

    # Save to disk with safe unique name
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_filename = Path(file.filename).name
    unique_name = f"{uuid.uuid4().hex}_{safe_filename}"
    saved_path = upload_dir / unique_name

    with open(saved_path, "wb") as f:
        f.write(content)

    # Create Document row
    doc = Document(
        filename=safe_filename,
        file_type=ext,
        stored_path=str(saved_path),
        page_count=0,
        chunk_count=0,
        status="processing",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:
        doc = ingest_document(db, doc)
        return doc
    except Exception as e:
        # Cleanup file and DB entry on failure
        if os.path.exists(saved_path):
            try:
                os.remove(saved_path)
            except OSError:
                pass
        db.delete(doc)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process and ingest document: {str(e)}",
        )


@router.get("", response_model=DocumentListOut)
def list_documents(db: Session = Depends(get_db)):
    """Lists all uploaded documents, newest first."""
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return {"documents": docs}


@router.get("/{id}", response_model=DocumentOut)
def get_document(id: int, db: Session = Depends(get_db)):
    """Retrieves metadata for a single document by ID."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {id} not found.",
        )
    return doc


@router.delete("/{id}")
def delete_document(id: int, db: Session = Depends(get_db)):
    """Deletes a document from the database, disk, and vector store."""
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {id} not found.",
        )

    # 1. Delete vector embeddings
    try:
        vector_store.delete_document(id)
    except Exception:
        pass

    # 2. Delete stored file
    if doc.stored_path and os.path.exists(doc.stored_path):
        try:
            os.remove(doc.stored_path)
        except OSError:
            pass

    # 3. Delete database record
    db.delete(doc)
    db.commit()

    return {"message": "Document deleted"}
