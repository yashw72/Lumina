import json
import logging
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import ChatSession, ChatMessage
from app.services import embeddings, vector_store, llm

logger = logging.getLogger("documentor.rag")

SYSTEM_INSTRUCTION = (
    "You are DocuMentor AI, a helpful and educational study assistant. "
    "Answer ONLY from the provided context blocks. "
    "Be clear, concise, and structured. "
    "If the answer cannot be determined from the context, clearly state that you could not find this in the uploaded documents."
)


def answer_question(
    db: Session,
    question: str,
    document_ids: Optional[List[int]] = None,
    session_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    RAG QA pipeline:
    1. Manage or create chat session and record user query.
    2. Check for short follow-up questions (< 6 words) and enrich retrieval query with previous question.
    3. Embed retrieval query and search vector store for top-K chunks.
    4. Guardrail against low-confidence chunks (< 0.25).
    5. Construct context-grounded prompt and query LLM.
    """
    settings = get_settings()

    # 1. Manage ChatSession
    session = None
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        session = ChatSession(id=session_id if session_id else str(uuid.uuid4()))
        db.add(session)
        db.commit()
        db.refresh(session)

    # Record user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=question,
        sources_json=None,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 2. Check for follow-up question
    retrieval_query = question
    words = question.strip().split()
    if len(words) < 6:
        prev_user_msg = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.session_id == session.id,
                ChatMessage.role == "user",
                ChatMessage.id != user_msg.id,
            )
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
        if prev_user_msg and prev_user_msg.content:
            retrieval_query = f"{prev_user_msg.content} {question}"
            logger.info("Enriched follow-up retrieval query: '%s'", retrieval_query)

    # 3. Vector search
    q_emb = embeddings.embed_query(retrieval_query)
    chunks = vector_store.query(
        query_embedding=q_emb,
        top_k=settings.TOP_K,
        document_ids=document_ids,
    )

    # 4. Guardrail: no chunks or relevance score below threshold
    if not chunks or max(c["score"] for c in chunks) < 0.25:
        answer = "I could not find this information in your uploaded documents."
        sources: List[Dict[str, Any]] = []

        assistant_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=answer,
            sources_json=json.dumps(sources),
        )
        db.add(assistant_msg)
        db.commit()

        return {
            "session_id": session.id,
            "answer": answer,
            "sources": sources,
        }

    # 5. Build prompt with context and history
    past_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id, ChatMessage.id != user_msg.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    recent_history = past_messages[-4:]

    history_text = ""
    if recent_history:
        history_text = "\n".join(f"{m.role.capitalize()}: {m.content}" for m in recent_history)
        history_text = f"Recent conversation history:\n{history_text}\n\n"

    context_blocks = []
    for i, c in enumerate(chunks, start=1):
        context_blocks.append(
            f"[Context {i}] (Source: {c['filename']}, Page {c['page']}):\n{c['text']}"
        )
    context_text = "\n\n".join(context_blocks)

    full_prompt = (
        f"{history_text}"
        f"Provided study context:\n{context_text}\n\n"
        f"Student question: {question}\n\n"
        f"Answer:"
    )

    # Call LLM
    answer = llm.generate(
        prompt=full_prompt,
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.2,
    )

    # Deduplicate sources
    seen_sources = set()
    sources = []
    for c in chunks:
        key = (c["document_id"], c["page"], c["text"][:60])
        if key not in seen_sources:
            seen_sources.add(key)
            sources.append({
                "document_id": c["document_id"],
                "filename": c["filename"],
                "page": c["page"],
                "snippet": c["text"][:200].strip(),
                "score": round(c["score"], 2),
            })

    # Persist assistant response
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=answer,
        sources_json=json.dumps(sources),
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "session_id": session.id,
        "answer": answer,
        "sources": sources,
    }
