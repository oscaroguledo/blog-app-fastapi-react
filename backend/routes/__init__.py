from .health import router as health_router
from .user import router as user_router
from .post import router as post_router
from .tag import router as tag_router
from .comment import router as comment_router

__all__ = ["health_router", "user_router", "post_router", "tag_router", "comment_router"]
