import logging
from sqlalchemy.orm import Session
from app.db.models import Document
from app.services import loaders, chunker, vector_store

logger = logging.getLogger("documentor.ingestion")


def ingest_document(db: Session, document: Document) -> Document:
    """
    Executes the ingestion pipeline:
    1. Extract page-by-page text using loaders.
    2. Split text into chunks using chunker.
    3. Generate embeddings and index chunks into ChromaDB.
    4. Update document metadata (page_count, chunk_count, status="ready").
    """
    try:
        pages = loaders.load_document(document.stored_path, document.file_type)
        chunks = chunker.chunk_pages(pages)

        if not chunks:
            raise ValueError(f"No valid text chunks could be extracted from '{document.filename}'.")

        vector_store.add_chunks(
            document_id=document.id,
            filename=document.filename,
            chunks=chunks,
        )

        document.page_count = len(pages)
        document.chunk_count = len(chunks)
        document.status = "ready"
        db.commit()
        db.refresh(document)
        logger.info(
            "Document id=%d (%s) ingested successfully. Pages=%d, Chunks=%d",
            document.id,
            document.filename,
            document.page_count,
            document.chunk_count,
        )
        return document
    except Exception as e:
        logger.error(
            "Ingestion failed for document id=%d (%s): %s",
            document.id,
            document.filename,
            str(e),
            exc_info=True,
        )
        document.status = "failed"
        db.commit()
        db.refresh(document)
        raise ValueError(f"Ingestion failed for '{document.filename}': {str(e)}") from e
