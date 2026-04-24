from core.types.guid import GUID
from sqlalchemy import String, Text, Integer, Index, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime, timezone
from core.database import Base


class PostCategory(Base):
    __tablename__ = "post_category"
    __table_args__ = (
        Index("ix_post_category_post_id", "post_id"),
        Index("ix_post_category_category_id", "category_id"),
        {"schema": "public"},
    )

    post_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.posts.id', ondelete='CASCADE'), primary_key=True
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.categories.id', ondelete='CASCADE'), primary_key=True
    )

    post = relationship("Post", back_populates="post_categories")
    category = relationship("Category", back_populates="post_categories")


class PostTag(Base):
    __tablename__ = "post_tag"
    __table_args__ = (
        Index("ix_post_tag_post_id", "post_id"),
        Index("ix_post_tag_tag_id", "tag_id"),
        {"schema": "public"},
    )

    post_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.posts.id', ondelete='CASCADE'), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.tags.id', ondelete='CASCADE'), primary_key=True
    )

    post = relationship("Post", back_populates="post_tags")
    tag = relationship("Tag", back_populates="post_tags")


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        Index("ix_posts_authorId", "authorId"),
        Index("ix_posts_created_at", "created_at"),
        Index("ix_posts_updated_at", "updated_at"),
        Index("ix_posts_isPublished", "isPublished"),
        Index("ix_posts_featured", "featured"),
        Index("ix_posts_likes", "likes"),
        Index("ix_posts_views", "views"),
        Index("ix_posts_readingTime", "readingTime"),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    excerpt: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    coverImage: Mapped[str] = mapped_column(String, nullable=False)
    authorId: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.users.id'), nullable=False
    )
    readingTime: Mapped[int] = mapped_column(Integer, nullable=False)
    likes: Mapped[int] = mapped_column(Integer, nullable=False)
    views: Mapped[int] = mapped_column(Integer, nullable=False)
    isPublished: Mapped[bool] = mapped_column(Boolean, nullable=False)
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    post_categories = relationship("PostCategory", back_populates="post", cascade="all, delete-orphan")
    post_tags = relationship("PostTag", back_populates="post", cascade="all, delete-orphan")

    @property
    def categories(self):
        return [pc.category for pc in self.post_categories]

    @property
    def tags(self):
        return [pt.tag for pt in self.post_tags]

    def __repr__(self):
        return f"<Post {self.id} {self.title}>"

    def to_dict(self):
        try:
            categories = [cat.name for cat in self.categories]
        except Exception:
            categories = []
        try:
            tags = [tag.name for tag in self.tags]
        except Exception:
            tags = []
        return {
            "id": str(self.id),
            "title": self.title,
            "excerpt": self.excerpt,
            "content": self.content,
            "coverImage": self.coverImage,
            "authorId": str(self.authorId),
            "categories": categories,
            "tags": tags,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat(),
            "readingTime": self.readingTime,
            "likes": self.likes,
            "views": self.views,
            "isPublished": self.isPublished,
            "featured": self.featured
        }
