from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.rag.chat import rag_chat
from backend.core.qa.answer import answer_question
from backend.db.collections import Collections
from backend.dependencies import db_dep
from backend.models.chat import ChatRequest, ChatResponse, SourceChunk

router = APIRouter()


@router.post("/docs/{doc_id}/chat", response_model=ChatResponse)
async def chat_doc(doc_id: str, req: ChatRequest, db: AsyncIOMotorDatabase = Depends(db_dep)):
    cols = Collections()
    doc = await db[cols.documents].find_one({"doc_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.get("status") != "completed":
        raise HTTPException(status_code=409, detail=f"Document not ready (status={doc.get('status')})")

    res = await answer_question(db, doc_id=doc_id, user_id=doc.get("user_id"), question=req.message, top_k=req.top_k)
    chunks = res.sources
    sources = [
        SourceChunk(chunk_id=str(c.get("chunk_id")), page=c.get("page"), text=str(c.get("text", ""))[:1200])
        for c in chunks
    ]
    return ChatResponse(answer=res.answer, sources=sources, provider_used=res.provider_used, answer_source=res.answer_source)

