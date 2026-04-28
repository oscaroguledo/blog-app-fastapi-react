from core.types.guid import GUID
from sqlalchemy import Text, Boolean, Index, DateTime
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from datetime import datetime, timezone
from core.database import Base


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_email", "email"),
        Index("ix_messages_created_at", "created_at"),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    subject: Mapped[str] = mapped_column(Text, nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Message {self.id} {self.email}>")

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "isRead": self.is_read,
            "createdAt": self.created_at.isoformat()
        }
from core.types.guid import GUID
from sqlalchemy import String, Text, Integer, Index, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime, timezone
from core.database import Base


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_sender_id", "sender_id"),
        Index("ix_messages_receiver_id", "receiver_id"),
        Index("ix_messages_created_at", "created_at"),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    sender_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.users.id', ondelete='CASCADE'), nullable=False
    )
    receiver_id: Mapped[uuid.UUID] = mapped_column(
        GUID, ForeignKey('public.users.id', ondelete='CASCADE'), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<Message {self.id} from {self.sender_id} to {self.receiver_id}>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "senderId": str(self.sender_id),
            "receiverId": str(self.receiver_id),
            "content": self.content,
            "isRead": self.is_read,
            "createdAt": self.created_at.isoformat()
        }