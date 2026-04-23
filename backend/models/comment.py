from core.types.guid import GUID
from sqlalchemy import String, Text, Integer, Index, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime, timezone
from core.database import Base


class Comment(Base):
    __tablename__ = "comments"
    
    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey('posts.id', ondelete='CASCADE'), nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    likes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(GUID, ForeignKey('comments.id', ondelete='CASCADE'), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Comment {self.id} {self.post_id} {self.author_id}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "postId": str(self.post_id),
            "authorId": str(self.author_id),
            "content": self.content,
            "createdAt": self.created_at.isoformat(),
            "likes": self.likes,
            "replies": [reply.to_dict() for reply in self.replies]
        }
