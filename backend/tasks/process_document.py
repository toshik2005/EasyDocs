from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.core.process_document import process_document


async def run_process_document(db: AsyncIOMotorDatabase, *, doc_id: str, job_id: str) -> None:
    await process_document(db, doc_id=doc_id, job_id=job_id)

