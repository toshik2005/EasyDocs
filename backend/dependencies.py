from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.db.mongo import get_db


async def db_dep() -> AsyncIOMotorDatabase:
    return get_db()

