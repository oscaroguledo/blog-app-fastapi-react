from core.types.guid import GUID
from sqlalchemy import String, Text, Index, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime, timezone
from core.database import Base


class Tag(Base):
    __tablename__ = "tags"
    __table_args__ = (
        Index("ix_tags_name", "name"),
        Index("ix_tags_slug", "slug"),
        Index("ix_tags_created_at", "created_at"),
        Index("ix_tags_updated_at", "updated_at"),
        {"schema": "blog"}
    )
    
    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    post_tags = relationship("PostTag", back_populates="tag", cascade="all, delete-orphan")
    
    @property
    def posts(self):
        return [pt.post for pt in self.post_tags]

    def __repr__(self):
        return f"<Tag {self.id} {self.name} {self.slug}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "createdAt": self.created_at.isoformat(),
            "updatedAt": self.updated_at.isoformat()
        }
