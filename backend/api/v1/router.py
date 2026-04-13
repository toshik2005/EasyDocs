from fastapi import APIRouter

from backend.api.v1 import upload, status, chat, documents

router = APIRouter(prefix="/api/v1")

router.include_router(upload.router, tags=["upload"])
router.include_router(status.router, tags=["status"])
router.include_router(chat.router, tags=["chat"])
router.include_router(documents.router, tags=["documents"])

