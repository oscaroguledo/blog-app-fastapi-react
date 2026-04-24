from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import init_db, check_db
from core.redis import redis_client
from core.config import settings
from core.utils.logger import info, success, warning, error
from core.middleware import rate_limit_middleware
from routes import health_router, user_router, post_router, tag_router, comment_router, category_router, contact_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    info("🚀 Starting application...")

    # Check database connection
    db_connected = await check_db()
    if not db_connected:
        warning("⚠️  Application started but database connection failed")

    # Check Redis connection
    redis_connected = await redis_client.init()
    if not redis_connected:
        warning("⚠️  Application started but Redis connection failed")

    success("✅ Application startup complete")

    yield

    # Shutdown
    info("🛑 Shutting down application...")
    await redis_client.close()
    success("✅ Application shutdown complete")


app = FastAPI(
    title="Blog API",
    description="A blog platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS.split(","),
    allow_headers=settings.CORS_ALLOW_HEADERS.split(","),
)

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Include routers
app.include_router(health_router)
app.include_router(user_router)
app.include_router(post_router)
app.include_router(tag_router)
app.include_router(comment_router)
app.include_router(category_router)
app.include_router(contact_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
