from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.db.collections import Collections
from backend.dependencies import db_dep

router = APIRouter()


@router.get("/jobs/{job_id}/status")
async def job_status(job_id: str, db: AsyncIOMotorDatabase = Depends(db_dep)):
    cols = Collections()
    job = await db[cols.jobs].find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

