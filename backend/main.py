import logging

from fastapi import FastAPI

from backend.api.v1.router import router as v1_router
from backend.config import ensure_data_dirs, get_settings
from backend.db.mongo import close_mongo, connect_mongo


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def create_app() -> FastAPI:
    _configure_logging()
    settings = get_settings()
    ensure_data_dirs()

    app = FastAPI(title=settings.app_name)

    @app.on_event("startup")
    async def _startup() -> None:
        connect_mongo()

    @app.on_event("shutdown")
    async def _shutdown() -> None:
        close_mongo()

    app.include_router(v1_router)
    return app


app = create_app()

