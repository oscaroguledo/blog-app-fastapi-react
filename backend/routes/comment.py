from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
from datetime import datetime
from core.database import get_db
from services.comment import CommentService
from core.utils.response import Response
from core.dependencies import get_current_user

router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("/")
async def create_comment(
    post_id: str,
    content: str,
    parent_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new comment."""
    comment_service = CommentService(db)
    
    try:
        comment = await comment_service.create(
            post_id=uuid.UUID(post_id),
            author_id=current_user.id,
            content=content,
            parent_id=uuid.UUID(parent_id) if parent_id else None
        )
        return Response(
            success=True,
            message="Comment created successfully",
            data=comment.to_dict(),
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
            message=f"Failed to create comment: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/")
async def list_comments(
    post_id: Optional[str] = None,
    author_id: Optional[str] = None,
    parent_id: Optional[str] = None,
    likes: Optional[int] = None,
    search_query: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    created_at: Optional[str] = None,
    updated_at: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List comments with filtering and pagination."""
    comment_service = CommentService(db)
    
    try:
        comments = await comment_service.list(
            post_id=uuid.UUID(post_id) if post_id else None,
            author_id=uuid.UUID(author_id) if author_id else None,
            parent_id=uuid.UUID(parent_id) if parent_id else None,
            likes=likes,
            search_query=search_query,
            limit=limit,
            offset=offset,
            created_at=datetime.fromisoformat(created_at) if created_at else None,
            updated_at=datetime.fromisoformat(updated_at) if updated_at else None
        )
        
        return Response(
            success=True,
            message="Comments retrieved successfully",
            data={"comments": [comment.to_dict() for comment in comments]},
            pagination={"limit": limit, "offset": offset, "total": len(comments)}
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.get("/{comment_id}")
async def get_comment(comment_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific comment by ID."""
    comment_service = CommentService(db)
    
    try:
        comment = await comment_service.get(uuid.UUID(comment_id))
        if not comment:
            return Response(
                success=False,
                message="Comment not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Comment retrieved successfully",
            data=comment.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid comment ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.patch("/{comment_id}")
async def update_comment(
    comment_id: str,
    content: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a comment."""
    comment_service = CommentService(db)
    
    try:
        # Check if user owns the comment or is admin
        comment = await comment_service.get(uuid.UUID(comment_id))
        if not comment:
            return Response(
                success=False,
                message="Comment not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        if comment.author_id != current_user.id and current_user.role.value != "Admin":
            return Response(
                success=False,
                message="You can only update your own comments",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        comment = await comment_service.update(
            uuid.UUID(comment_id),
            content=content
        )
        
        return Response(
            success=True,
            message="Comment updated successfully",
            data=comment.to_dict()
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a comment."""
    comment_service = CommentService(db)
    
    try:
        # Check if user owns the comment or is admin
        comment = await comment_service.get(uuid.UUID(comment_id))
        if not comment:
            return Response(
                success=False,
                message="Comment not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        if comment.author_id != current_user.id and current_user.role.value != "Admin":
            return Response(
                success=False,
                message="You can only delete your own comments",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        success = await comment_service.delete(uuid.UUID(comment_id))
        
        return Response(
            success=True,
            message="Comment deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid comment ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{comment_id}/like")
async def like_comment(comment_id: str, db: AsyncSession = Depends(get_db)):
    """Increment a comment's like count."""
    comment_service = CommentService(db)
    
    try:
        comment = await comment_service.increment_likes(uuid.UUID(comment_id))
        if not comment:
            return Response(
                success=False,
                message="Comment not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Comment liked successfully",
            data=comment.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid comment ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{comment_id}/unlike")
async def unlike_comment(comment_id: str, db: AsyncSession = Depends(get_db)):
    """Decrement a comment's like count."""
    comment_service = CommentService(db)
    
    try:
        comment = await comment_service.decrement_likes(uuid.UUID(comment_id))
        if not comment:
            return Response(
                success=False,
                message="Comment not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Comment unliked successfully",
            data=comment.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid comment ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )
