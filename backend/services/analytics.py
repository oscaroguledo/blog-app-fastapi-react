from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, text
from sqlalchemy.exc import IntegrityError
from models.analytics import PageView, DailyViewStat
from models.post import Post
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def track_page_view(
        self,
        post_id: Optional[uuid.UUID],
        visitor_id: str,
        path: str,
        referrer: Optional[str] = None
    ) -> PageView:
        """Track a page view."""
        page_view = PageView(
            post_id=post_id,
            visitor_id=visitor_id,
            path=path,
            referrer=referrer
        )
        self.db.add(page_view)

        # Update daily stats
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(DailyViewStat).where(DailyViewStat.date == today)
        )
        daily_stat = result.scalar_one_or_none()

        if daily_stat:
            daily_stat.total_views += 1
            # Check if this is a unique visitor today
            unique_check = await self.db.execute(
                select(func.count(PageView.id)).where(
                    and_(
                        PageView.visitor_id == visitor_id,
                        PageView.created_at >= today
                    )
                )
            )
            count = unique_check.scalar()
            if count <= 1:
                daily_stat.unique_visitors += 1
        else:
            daily_stat = DailyViewStat(
                date=today,
                total_views=1,
                unique_visitors=1
            )
            self.db.add(daily_stat)

        try:
            await self.db.commit()
        except IntegrityError:
            # Race condition: another request created the daily stat first
            await self.db.rollback()
            # Re-fetch and increment instead
            result = await self.db.execute(
                select(DailyViewStat).where(DailyViewStat.date == today)
            )
            daily_stat = result.scalar_one_or_none()
            if daily_stat:
                daily_stat.total_views += 1
                daily_stat.unique_visitors += 1
                await self.db.commit()

        await self.db.refresh(page_view)
        return page_view

    async def get_traffic_overview(self, days: int = 7) -> dict:
        """Get traffic overview for the last N days."""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        # Get daily stats
        result = await self.db.execute(
            select(DailyViewStat)
            .where(DailyViewStat.date >= start_date)
            .order_by(DailyViewStat.date)
        )
        daily_stats = result.scalars().all()

        # Fill in missing days with zero values
        stats_by_date = {stat.date.date(): stat for stat in daily_stats}
        filled_stats = []
        for i in range(days):
            date = (datetime.now(timezone.utc) - timedelta(days=days - 1 - i)).date()
            if date in stats_by_date:
                stat = stats_by_date[date]
                filled_stats.append({
                    "date": stat.date.isoformat(),
                    "day": stat.date.strftime("%a"),
                    "total_views": stat.total_views,
                    "unique_visitors": stat.unique_visitors
                })
            else:
                date_time = datetime.combine(date, datetime.min.time(), tzinfo=timezone.utc)
                filled_stats.append({
                    "date": date_time.isoformat(),
                    "day": date_time.strftime("%a"),
                    "total_views": 0,
                    "unique_visitors": 0
                })

        # Get total views from tracked PageView records (single source of truth)
        total_result = await self.db.execute(
            select(func.count(PageView.id))
        )
        total_views = total_result.scalar() or 0

        # Get total unique visitors in the period
        unique_result = await self.db.execute(
            select(func.count(func.distinct(PageView.visitor_id)))
            .where(PageView.created_at >= start_date)
        )
        unique_visitors = unique_result.scalar() or 0

        # Get total page views in the period
        period_views_result = await self.db.execute(
            select(func.count(PageView.id))
            .where(PageView.created_at >= start_date)
        )
        period_views = period_views_result.scalar() or 0

        return {
            "total_views": total_views,
            "period_views": period_views,
            "unique_visitors": unique_visitors,
            "daily_stats": filled_stats
        }

    async def get_top_posts(self, limit: int = 5) -> List[dict]:
        """Get top posts by views."""
        result = await self.db.execute(
            select(Post)
            .order_by(Post.views.desc())
            .limit(limit)
        )
        posts = result.scalars().all()

        return [
            {
                "id": str(post.id),
                "title": post.title,
                "views": post.views,
                "likes": post.likes
            }
            for post in posts
        ]

    async def get_top_referrers(self, days: int = 7, limit: int = 5) -> List[dict]:
        """Get top referrers in the last N days."""
        start_date = datetime.now(timezone.utc) - timedelta(days=days)

        result = await self.db.execute(
            select(PageView.referrer, func.count(PageView.id).label('count'))
            .where(
                and_(
                    PageView.created_at >= start_date,
                    PageView.referrer.isnot(None),
                    PageView.referrer != ''
                )
            )
            .group_by(PageView.referrer)
            .order_by(func.count(PageView.id).desc())
            .limit(limit)
        )
        referrers = result.all()

        return [
            {"referrer": ref, "count": count}
            for ref, count in referrers
        ]
