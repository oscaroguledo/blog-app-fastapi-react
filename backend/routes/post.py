from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
import uuid
from datetime import datetime
from core.database import get_db
from services.post import PostService
from core.utils.response import Response
from core.dependencies import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/")
async def create_post(
    title: str,
    excerpt: str,
    content: str,
    coverImage: str,
    category_ids: Optional[str] = None,
    tag_ids: Optional[str] = None,
    isPublished: bool = False,
    featured: bool = False,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new post."""
    post_service = PostService(db)
    
    try:
        # Parse category_ids and tag_ids if provided as comma-separated strings
        cat_ids = [uuid.UUID(cid.strip()) for cid in category_ids.split(",")] if category_ids else None
        tag_ids_list = [uuid.UUID(tid.strip()) for tid in tag_ids.split(",")] if tag_ids else None
        
        post = await post_service.create(
            title=title,
            excerpt=excerpt,
            content=content,
            coverImage=coverImage,
            authorId=current_user.id,
            category_ids=cat_ids,
            tag_ids=tag_ids_list,
            isPublished=isPublished,
            featured=featured
        )
        return Response(
            success=True,
            message="Post created successfully",
            data=post.to_dict(),
            status_code=status.HTTP_201_CREATED
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            success=False,
            message=f"Failed to create post: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/")
async def list_posts(
    author_id: Optional[str] = None,
    reading_time: Optional[int] = None,
    likes: Optional[int] = None,
    views: Optional[int] = None,
    is_published: Optional[bool] = None,
    featured: Optional[bool] = None,
    search_query: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    start_at: Optional[str] = None,
    end_at: Optional[str] = None,
    category_id: Optional[str] = None,
    tag_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List posts with filtering and pagination."""
    post_service = PostService(db)
    
    try:
        posts = await post_service.list(
            author_id=uuid.UUID(author_id) if author_id else None,
            reading_time=reading_time,
            likes=likes,
            views=views,
            is_published=is_published,
            featured=featured,
            search_query=search_query,
            limit=limit,
            offset=offset,
            start_at=datetime.fromisoformat(start_at) if start_at else None,
            end_at=datetime.fromisoformat(end_at) if end_at else None,
            category_id=uuid.UUID(category_id) if category_id else None,
            tag_id=uuid.UUID(tag_id) if tag_id else None
        )
        
        return Response(
            success=True,
            message="Posts retrieved successfully",
            data=[post.to_dict() for post in posts],
            pagination={"limit": limit, "offset": offset, "total": len(posts)}
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )

@router.get("/latest")
async def latest_posts(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """List posts with filtering and pagination."""
    post_service = PostService(db)
    
    try:
        posts = await post_service.list(
            limit=limit if limit else 10,
        )
        
        return Response(
            success=True,
            message="Posts retrieved successfully",
            data=[post.to_dict() for post in posts]
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )

@router.get("/{post_id}")
async def get_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific post by ID."""
    post_service = PostService(db)
    
    try:
        post = await post_service.get(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post retrieved successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.patch("/{post_id}")
async def update_post(
    post_id: str,
    title: Optional[str] = None,
    excerpt: Optional[str] = None,
    content: Optional[str] = None,
    coverImage: Optional[str] = None,
    isPublished: Optional[bool] = None,
    featured: Optional[bool] = None,
    category_ids: Optional[str] = None,
    tag_ids: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a post."""
    post_service = PostService(db)
    
    try:
        # Check if user owns the post or is admin
        post = await post_service.get(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        if post.authorId != current_user.id and current_user.role.value != "Admin":
            return Response(
                success=False,
                message="You can only update your own posts",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        cat_ids = [uuid.UUID(cid.strip()) for cid in category_ids.split(",")] if category_ids else None
        tag_ids_list = [uuid.UUID(tid.strip()) for tid in tag_ids.split(",")] if tag_ids else None
        
        post = await post_service.update(
            uuid.UUID(post_id),
            title=title,
            excerpt=excerpt,
            content=content,
            coverImage=coverImage,
            isPublished=isPublished,
            featured=featured,
            category_ids=cat_ids,
            tag_ids=tag_ids_list
        )
        
        return Response(
            success=True,
            message="Post updated successfully",
            data=post.to_dict()
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a post."""
    post_service = PostService(db)
    
    try:
        # Check if user owns the post or is admin
        post = await post_service.get(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        if post.authorId != current_user.id and current_user.role.value != "Admin":
            return Response(
                success=False,
                message="You can only delete your own posts",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        success = await post_service.delete(uuid.UUID(post_id))
        
        return Response(
            success=True,
            message="Post deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/like")
async def like_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Increment a post's like count."""
    post_service = PostService(db)
    
    try:
        post = await post_service.increment_likes(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post liked successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/unlike")
async def unlike_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Decrement a post's like count."""
    post_service = PostService(db)
    
    try:
        post = await post_service.decrement_likes(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post unliked successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/view")
async def view_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Increment a post's view count."""
    post_service = PostService(db)
    
    try:
        post = await post_service.increment_views(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post viewed successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/publish")
async def publish_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Publish a post."""
    post_service = PostService(db)
    
    try:
        post = await post_service.publish(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post published successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/unpublish")
async def unpublish_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Unpublish a post."""
    post_service = PostService(db)
    
    try:
        post = await post_service.unpublish(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post unpublished successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/feature")
async def feature_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Feature a post."""
    post_service = PostService(db)
    
    try:
        post = await post_service.feature(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Post featured successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{post_id}/unfeature")
async def unfeature_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Unfeature a post."""
    post_service = PostService(db)

    try:
        post = await post_service.unfeature(uuid.UUID(post_id))
        if not post:
            return Response(
                success=False,
                message="Post not found",
                status_code=status.HTTP_404_NOT_FOUND
            )

        return Response(
            success=True,
            message="Post unfeatured successfully",
            data=post.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid post ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )
