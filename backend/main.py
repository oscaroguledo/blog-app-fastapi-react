from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import init_db
from routes import health_router, user_router, post_router, tag_router, comment_router, category_router, contact_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    yield
    # Shutdown
    pass


app = FastAPI(
    title="Blog API",
    description="A modern blog platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
