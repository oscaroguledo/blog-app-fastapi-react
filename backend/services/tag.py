from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from models.tag import Tag
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class TagService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        name: str,
        slug: str,
        description: Optional[str] = None
    ) -> Tag:
        """Create a new tag."""
        if not name:
            raise ValueError("Name is required")
        if not slug:
            raise ValueError("Slug is required")
        
        tag = Tag(
            name=name,
            slug=slug,
            description=description
        )
        self.db.add(tag)
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def get(self, tag_id: Optional[uuid.UUID] = None, slug: Optional[str] = None, name: Optional[str] = None) -> Optional[Tag]:
        """Get a tag by ID."""
        if not tag_id and not slug and not name:
            raise ValueError("At least one of tag_id, slug, or name must be provided")
        query = select(Tag)
        if tag_id:
            query = query.where(Tag.id == tag_id)
        if slug:
            query = query.where(Tag.slug == slug)
        if name:
            query = query.where(Tag.name == name)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    

    async def list(
        self,
        search_query: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None
    ) -> List[Tag]:
        """List tags with optional search and pagination."""
        query = select(Tag)
        
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.where(
                and_(
                    Tag.name.ilike(search_pattern),
                    Tag.slug.ilike(search_pattern),
                    Tag.description.ilike(search_pattern)
                )
            )
        
        if created_at:
            query = query.where(Tag.created_at == created_at)
        
        if updated_at:
            query = query.where(Tag.updated_at == updated_at)
        
        query = query.order_by(Tag.name.asc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update(
        self,
        tag_id: uuid.UUID,
        name: Optional[str] = None,
        slug: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[Tag]:
        """Update a tag."""
        tag = await self.get(tag_id, name=name, slug=slug)
        if not tag:
            return None
        
        if name is not None:
            tag.name = name
        if slug is not None:
            tag.slug = slug
        if description is not None:
            tag.description = description
        
        await self.db.commit()
        await self.db.refresh(tag)
        return tag

    async def delete(self, tag_id: uuid.UUID) -> bool:
        """Delete a tag."""
        tag = await self.get(tag_id)
        if not tag:
            return False
        
        await self.db.delete(tag)
        await self.db.commit()
        return True
