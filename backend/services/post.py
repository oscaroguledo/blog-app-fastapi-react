from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from models.post import Post, PostCategory, PostTag
from models.category import Category
from models.tag import Tag
from typing import Optional, List
import uuid
from datetime import datetime, timezone


class PostService:
    def __init__(self, db: AsyncSession):
        self.db = db
    def _get_reading_time(self, content: str) -> int:
        """Calculate reading time in minutes."""
        word_count = len(content.split())
        return max(1, round(word_count / 200))
    
    async def create(
        self,
        title: str,
        excerpt: str,
        content: str,
        coverImage: str,
        authorId: uuid.UUID,
        category_ids: Optional[List[uuid.UUID]] = None,
        tag_ids: Optional[List[uuid.UUID]] = None,
        isPublished: bool = False,
        featured: bool = False
    ) -> Post:
        """Create a new post."""
        if not title:
            raise ValueError("Title is required")
        if not content:
            raise ValueError("Content is required")
        
        reading_time = self._get_reading_time(content)
        
        post = Post(
            title=title,
            excerpt=excerpt,
            content=content,
            coverImage=coverImage,
            authorId=authorId,
            readingTime=reading_time,
            likes=0,
            views=0,
            isPublished=isPublished,
            featured=featured
        )
        self.db.add(post)
        await self.db.flush()  # Flush to get the post ID
        
        # Add categories
        if category_ids:
            for category_id in category_ids:
                post_category = PostCategory(post_id=post.id, category_id=category_id)
                self.db.add(post_category)
        
        # Add tags
        if tag_ids:
            for tag_id in tag_ids:
                post_tag = PostTag(post_id=post.id, tag_id=tag_id)
                self.db.add(post_tag)
        
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def get(self, post_id: uuid.UUID) -> Optional[Post]:
        """Get a post by ID."""
        result = await self.db.execute(select(Post).where(Post.id == post_id))
        return result.scalar_one_or_none()

    async def list(
        self,
        author_id: Optional[uuid.UUID] = None,
        reading_time: Optional[int] = None,
        likes: Optional[int] = None,
        views: Optional[int] = None,
        is_published: Optional[bool] = None,
        featured: Optional[bool] = None,
        search_query: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None,
        category_id: Optional[uuid.UUID] = None,
        tag_id: Optional[uuid.UUID] = None,
    ) -> List[Post]:
        """List posts with filtering and pagination."""
        query = select(Post)
        
        conditions = []
        if author_id is not None:
            conditions.append(Post.authorId == author_id)
        if is_published is not None:
            conditions.append(Post.isPublished == is_published)
        if featured is not None:
            conditions.append(Post.featured == featured)
        if start_at is not None:
            conditions.append(Post.created_at >= start_at)
        if end_at is not None:
            conditions.append(Post.created_at <= end_at)
        
        if reading_time is not None:
            conditions.append(Post.readingTime == reading_time)
        if likes is not None:
            conditions.append(Post.likes == likes)
        if views is not None:
            conditions.append(Post.views == views)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Search in title, excerpt and content
        if search_query:
            search_pattern = f"%{search_query}%"
            query = query.where(
                or_(
                    Post.title.ilike(search_pattern),
                    Post.excerpt.ilike(search_pattern),
                    Post.content.ilike(search_pattern)
                )
            )
        
        # Filter by category
        if category_id:
            query = query.join(PostCategory).where(PostCategory.category_id == category_id)
        
        # Filter by tag
        if tag_id:
            query = query.join(PostTag).where(PostTag.tag_id == tag_id)
        
        query = query.order_by(Post.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update(
        self,
        post_id: uuid.UUID,
        title: Optional[str] = None,
        excerpt: Optional[str] = None,
        content: Optional[str] = None,
        coverImage: Optional[str] = None,
        isPublished: Optional[bool] = None,
        featured: Optional[bool] = None,
        category_ids: Optional[List[uuid.UUID]] = None,
        tag_ids: Optional[List[uuid.UUID]] = None
    ) -> Optional[Post]:
        """Update a post."""
        post = await self.get(post_id)
        if not post:
            return None
        
        if title is not None:
            post.title = title
        if excerpt is not None:
            post.excerpt = excerpt
        if content is not None:
            post.content = content
            # Recalculate reading time when content changes
            post.readingTime = self._get_reading_time(content)
        if coverImage is not None:
            post.coverImage = coverImage
        if isPublished is not None:
            post.isPublished = isPublished
        if featured is not None:
            post.featured = featured
        
        # Update categories if provided
        if category_ids is not None:
            # Remove existing categories
            await self.db.execute(
                select(PostCategory).where(PostCategory.post_id == post_id)
            )
            existing_categories = (await self.db.execute(
                select(PostCategory).where(PostCategory.post_id == post_id)
            )).scalars().all()
            for pc in existing_categories:
                await self.db.delete(pc)
            
            # Add new categories
            for category_id in category_ids:
                post_category = PostCategory(post_id=post_id, category_id=category_id)
                self.db.add(post_category)
        
        # Update tags if provided
        if tag_ids is not None:
            # Remove existing tags
            existing_tags = (await self.db.execute(
                select(PostTag).where(PostTag.post_id == post_id)
            )).scalars().all()
            for pt in existing_tags:
                await self.db.delete(pt)
            
            # Add new tags
            for tag_id in tag_ids:
                post_tag = PostTag(post_id=post_id, tag_id=tag_id)
                self.db.add(post_tag)
        
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def delete(self, post_id: uuid.UUID) -> bool:
        """Delete a post."""
        post = await self.get(post_id)
        if not post:
            return False
        
        await self.db.delete(post)
        await self.db.commit()
        return True

    async def increment_likes(self, post_id: uuid.UUID) -> Optional[Post]:
        """Increment a post's like count."""
        post = await self.get(post_id)
        if not post:
            return None
        
        post.likes += 1
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def decrement_likes(self, post_id: uuid.UUID) -> Optional[Post]:
        """Decrement a post's like count."""
        post = await self.get(post_id)
        if not post:
            return None
        
        if post.likes > 0:
            post.likes -= 1
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def increment_views(self, post_id: uuid.UUID) -> Optional[Post]:
        """Increment a post's view count."""
        post = await self.get(post_id)
        if not post:
            return None
        
        post.views += 1
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def publish(self, post_id: uuid.UUID) -> Optional[Post]:
        """Publish a post."""
        post = await self.get(post_id)
        if not post:
            return None
        
        post.isPublished = True
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def unpublish(self, post_id: uuid.UUID) -> Optional[Post]:
        """Unpublish a post."""
        post = await self.get(post_id)
        if not post:
            return None
        
        post.isPublished = False
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def feature(self, post_id: uuid.UUID) -> Optional[Post]:
        """Feature a post."""
        post = await self.get(post_id)
        if not post:
            return None
        
        post.featured = True
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def unfeature(self, post_id: uuid.UUID) -> Optional[Post]:
        """Unfeature a post."""
        post = await self.get(post_id)
        if not post:
            return None
        
        post.featured = False
        await self.db.commit()
        await self.db.refresh(post)
        return post
