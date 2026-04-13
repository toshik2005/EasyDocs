from __future__ import annotations

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from backend.config import get_settings

logger = logging.getLogger(__name__)

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def connect_mongo() -> None:
    global _client, _db
    if _client is not None and _db is not None:
        return

    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongo_uri)
    _db = _client[settings.mongo_db]
    logger.info("Mongo connected", extra={"mongo_db": settings.mongo_db})


def close_mongo() -> None:
    global _client, _db
    if _client is None:
        return
    _client.close()
    _client = None
    _db = None
    logger.info("Mongo closed")


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        connect_mongo()
    assert _db is not None
    return _db

