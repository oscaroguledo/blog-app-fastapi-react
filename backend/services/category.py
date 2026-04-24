from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from models.category import Category
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        name: str,
        slug: str,
        description: Optional[str] = None
    ) -> Category:
        """Create a new category."""
        if not name:
            raise ValueError("Name is required")
        if not slug:
            raise ValueError("Slug is required")
        
        category = Category(
            name=name,
            slug=slug,
            description=description
        )
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def get(self, category_id: Optional[uuid.UUID] = None, slug: Optional[str] = None, name: Optional[str] = None) -> Optional[Category]:
        """Get a category by ID, slug, or name."""
        if not category_id and not slug and not name:
            raise ValueError("At least one of category_id, slug, or name must be provided")
        
        query = select(Category)
        if category_id:
            query = query.where(Category.id == category_id)
        if slug:
            query = query.where(Category.slug == slug)
        if name:
            query = query.where(Category.name == name)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list(
        self,
        search_query: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None
    ) -> List[Category]:
        """List categories with optional search and pagination."""
        query = select(Category)
        
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.where(
                or_(
                    Category.name.ilike(search_pattern),
                    Category.slug.ilike(search_pattern),
                    Category.description.ilike(search_pattern)
                )
            )
        
        if start_at:
            query = query.where(Category.created_at >= start_at)
        
        if end_at:
            query = query.where(Category.created_at <= end_at)
        
        query = query.order_by(Category.name.asc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update(
        self,
        category_id: uuid.UUID,
        name: Optional[str] = None,
        slug: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[Category]:
        """Update a category."""
        category = await self.get(category_id)
        if not category:
            return None
        
        if name is not None:
            category.name = name
        if slug is not None:
            category.slug = slug
        if description is not None:
            category.description = description
        
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category_id: uuid.UUID) -> bool:
        """Delete a category."""
        category = await self.get(category_id)
        if not category:
            return False
        
        await self.db.delete(category)
        await self.db.commit()
        return True
