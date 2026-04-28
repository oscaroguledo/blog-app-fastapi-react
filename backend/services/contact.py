from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from models.contact import Contact
from typing import Optional, List, Tuple
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

    async def list(self, limit: int = 100, offset: int = 0, q: Optional[str] = None) -> Tuple[List[Contact], int]:
        """Return a list of contacts and the total matching count.

        Args:
            limit: page size
            offset: offset
            q: optional search query (matches name, email, subject, message)

        Returns: (items, total)
        """
        base = select(Contact)
        if q:
            like = f"%{q}%"
            base = base.where(
                or_(
                    Contact.name.ilike(like),
                    Contact.email.ilike(like),
                    Contact.subject.ilike(like),
                    Contact.message.ilike(like),
                )
            )

        total_q = select(func.count()).select_from(base.subquery())
        total_res = await self.db.execute(total_q)
        total = int(total_res.scalar() or 0)

        query = base.order_by(Contact.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        items = result.scalars().all()
        return items, total

    async def mark_read(self, contact_id: uuid.UUID) -> Optional[Contact]:
        result = await self.db.execute(select(Contact).where(Contact.id == contact_id))
        msg = result.scalar_one_or_none()
        if not msg:
            return None
        msg.is_read = True
        await self.db.commit()
        await self.db.refresh(msg)
        return msg
