from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.db.collections import Collections
from backend.dependencies import db_dep
from backend.models.document import DocumentInDB

router = APIRouter()

@router.get("/docs", response_model=list[DocumentInDB])
async def list_documents(db: AsyncIOMotorDatabase = Depends(db_dep)):
    cols = Collections()
    cursor = db[cols.documents].find().sort("created_at", -1)
    documents = await cursor.to_list(length=200)
    return [DocumentInDB(**doc) for doc in documents]

@router.get("/docs/{doc_id}", response_model=DocumentInDB)
async def get_document(doc_id: str, db: AsyncIOMotorDatabase = Depends(db_dep)):
    cols = Collections()
    doc = await db[cols.documents].find_one({"doc_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentInDB(**doc)
