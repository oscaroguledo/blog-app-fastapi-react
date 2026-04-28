from core.types.guid import GUID
from sqlalchemy import String, Integer, Index, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime, timezone
from core.database import Base


class PageView(Base):
    __tablename__ = "page_views"
    __table_args__ = (
        Index("ix_page_views_post_id", "post_id"),
        Index("ix_page_views_created_at", "created_at"),
        Index("ix_page_views_visitor_id", "visitor_id"),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID | None] = mapped_column(GUID, ForeignKey('public.posts.id', ondelete='SET NULL'), nullable=True)
    visitor_id: Mapped[str] = mapped_column(String, nullable=False)
    path: Mapped[str] = mapped_column(String, nullable=False)
    referrer: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    post = relationship("Post", backref="page_views")

    def __repr__(self):
        return f"<PageView {self.id} {self.path}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "post_id": str(self.post_id) if self.post_id else None,
            "visitor_id": self.visitor_id,
            "path": self.path,
            "referrer": self.referrer,
            "created_at": self.created_at.isoformat()
        }


class DailyViewStat(Base):
    __tablename__ = "daily_view_stats"
    __table_args__ = (
        Index("ix_daily_view_stats_date", "date", unique=True),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, unique=True)
    total_views: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    unique_visitors: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    def __repr__(self):
        return f"<DailyViewStat {self.date} views={self.total_views}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "date": self.date.isoformat(),
            "total_views": self.total_views,
            "unique_visitors": self.unique_visitors
        }
