from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from models.comment import Comment
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        post_id: uuid.UUID,
        author_id: uuid.UUID,
        content: str,
        parent_id: Optional[uuid.UUID] = None
    ) -> Comment:
        """Create a new comment."""
        if not content:
            raise ValueError("Content is required")
        if not post_id:
            raise ValueError("Post ID is required")
        if not author_id:
            raise ValueError("Author ID is required")
        
        comment = Comment(
            post_id=post_id,
            author_id=author_id,
            content=content,
            parent_id=parent_id,
            likes=0
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def get(self, comment_id: uuid.UUID) -> Optional[Comment]:
        """Get a comment by ID."""
        result = await self.db.execute(select(Comment).where(Comment.id == comment_id))
        return result.scalar_one_or_none()

    async def list(
        self,
        post_id: Optional[uuid.UUID] = None,
        author_id: Optional[uuid.UUID] = None,
        parent_id: Optional[uuid.UUID] = None,
        likes: Optional[int] = None,
        search_query: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None
    ) -> List[Comment]:
        """List comments with filtering and pagination."""
        query = select(Comment)
        
        conditions = []
        if post_id is not None:
            conditions.append(Comment.post_id == post_id)
        if author_id is not None:
            conditions.append(Comment.author_id == author_id)
        if parent_id is not None:
            conditions.append(Comment.parent_id == parent_id)
        if likes is not None:
            conditions.append(Comment.likes == likes)
        if start_at is not None:
            conditions.append(Comment.created_at >= start_at)
        if end_at is not None:
            conditions.append(Comment.created_at <= end_at)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Search in content
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.where(Comment.content.ilike(search_pattern))
        
        query = query.order_by(Comment.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()


    async def update(
        self,
        comment_id: uuid.UUID,
        content: Optional[str] = None
    ) -> Optional[Comment]:
        """Update a comment."""
        comment = await self.get(comment_id)
        if not comment:
            return None
        
        if content is not None:
            comment.content = content
        
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def delete(self, comment_id: uuid.UUID) -> bool:
        """Delete a comment."""
        comment = await self.get(comment_id)
        if not comment:
            return False
        
        await self.db.delete(comment)
        await self.db.commit()
        return True

    async def increment_likes(self, comment_id: uuid.UUID) -> Optional[Comment]:
        """Increment a comment's like count."""
        comment = await self.get(comment_id)
        if not comment:
            return None
        
        comment.likes += 1
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def decrement_likes(self, comment_id: uuid.UUID) -> Optional[Comment]:
        """Decrement a comment's like count."""
        comment = await self.get(comment_id)
        if not comment:
            return None
        
        if comment.likes > 0:
            comment.likes -= 1
        await self.db.commit()
        await self.db.refresh(comment)
        return comment
