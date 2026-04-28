from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.contact import Contact
from typing import Optional, List
import uuid


class ContactService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        name: str,
        email: str,
        subject: Optional[str],
        message: str
    ) -> Contact:
        if not name:
            raise ValueError("Name is required")
        if not email:
            raise ValueError("Email is required")
        if not message:
            raise ValueError("Message is required")

        msg = Contact(
            name=name,
            email=email,
            subject=subject,
            message=message,
            is_read=False
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def list(self, limit: int = 100, offset: int = 0) -> List[Contact]:
        query = select(Contact).order_by(Contact.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def mark_read(self, contact_id: uuid.UUID) -> Optional[Contact]:
        result = await self.db.execute(select(Contact).where(Contact.id == contact_id))
        msg = result.scalar_one_or_none()
        if not msg:
            return None
        msg.is_read = True
        await self.db.commit()
        await self.db.refresh(msg)
        return msg
