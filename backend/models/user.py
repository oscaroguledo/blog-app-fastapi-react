from core.types.guid import GUID
from sqlalchemy import String, Text, Index, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from enum import Enum
from datetime import datetime, timezone
from core.database import Base

class UserRole(Enum):
    WRITER = "Writer"
    EDITOR = "Editor"
    ADMIN = "Admin"
    READER = "Reader"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("created_at_idx", "created_at"),
        Index("updated_at_idx", "updated_at"),
        Index("active_idx", "active"),
        Index("role_idx", "role"),
        {"schema": "public"}
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, index=True, unique=True)
    firstName: Mapped[str] = mapped_column(String, nullable=False)
    lastName: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    avatar: Mapped[str | None] = mapped_column(String, nullable=True)
    role: Mapped[UserRole] = mapped_column(String, nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Relationships
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="author")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<User {self.id} {self.firstName} {self.lastName} {self.email}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            "avatar": self.avatar,
            "role": self.role.value,
            "bio": self.bio,
            "active": self.active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }