from core.types.guid import GUID
from sqlalchemy import Text, Boolean, Index, DateTime
from sqlalchemy.orm import Mapped, mapped_column
import uuid
from datetime import datetime, timezone
from core.database import Base


class Contact(Base):
    __tablename__ = "contacts"
    __table_args__ = (
        Index("ix_contacts_email", "email"),
        Index("ix_contacts_created_at", "created_at"),
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
        return f"<Contact {self.id} {self.email}>"

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
