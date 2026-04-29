from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.utils.response import Response
from services.analytics import AnalyticsService
from routes.user import get_current_admin
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/track")
async def track_page_view(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Track a page view."""
    try:
        data = await request.json()
        post_id = data.get("post_id")
        visitor_id = data.get("visitor_id")
        path = data.get("path")
        referrer = data.get("referrer")

        if not visitor_id or not path:
            return Response(
                success=False,
                message="visitor_id and path are required",
                status_code=400
            )

        analytics_service = AnalyticsService(db)

        page_view = await analytics_service.track_page_view(
            post_id=uuid.UUID(post_id) if post_id else None,
            visitor_id=visitor_id,
            path=path,
            referrer=referrer
        )

        return Response(
            success=True,
            message="Page view tracked",
            data=page_view.to_dict()
        )
    except Exception as e:
        print(f"[ERROR] Failed to track page view: {e}")
        return Response(
            success=True,
            message="Tracking skipped",
            status_code=200
        )


@router.get("/overview")
async def get_traffic_overview(
    days: int = 7,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get traffic overview (admin only)."""
    analytics_service = AnalyticsService(db)

    overview = await analytics_service.get_traffic_overview(days=days)

    return Response(
        success=True,
        message="Traffic overview retrieved",
        data=overview
    )


@router.get("/top-posts")
async def get_top_posts(
    limit: int = 5,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get top posts by views (admin only)."""
    analytics_service = AnalyticsService(db)

    top_posts = await analytics_service.get_top_posts(limit=limit)

    return Response(
        success=True,
        message="Top posts retrieved",
        data=top_posts
    )


@router.get("/top-referrers")
async def get_top_referrers(
    days: int = 7,
    limit: int = 5,
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get top referrers (admin only)."""
    analytics_service = AnalyticsService(db)

    referrers = await analytics_service.get_top_referrers(days=days, limit=limit)

    return Response(
        success=True,
        message="Top referrers retrieved",
        data=referrers
    )


@router.get("/posts-by-category")
async def get_posts_by_category(
    current_admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get post counts per category (admin only)."""
    analytics_service = AnalyticsService(db)

    data = await analytics_service.get_posts_by_category()

    return Response(
        success=True,
        message="Posts by category retrieved",
        data=data
    )
