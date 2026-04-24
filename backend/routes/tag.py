from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
from datetime import datetime
from core.database import get_db
from services.tag import TagService
from core.utils.response import Response

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("/")
async def create_tag(
    name: str,
    slug: str,
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Create a new tag."""
    tag_service = TagService(db)
    
    try:
        tag = await tag_service.create(
            name=name,
            slug=slug,
            description=description
        )
        return Response(
            success=True,
            message="Tag created successfully",
            data=tag.to_dict(),
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
            message=f"Failed to create tag: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/")
async def list_tags(
    search_query: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    created_at: Optional[str] = None,
    updated_at: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List tags with optional search and pagination."""
    tag_service = TagService(db)
    
    try:
        tags = await tag_service.list(
            search_query=search_query,
            limit=limit,
            offset=offset,
            created_at=datetime.fromisoformat(created_at) if created_at else None,
            updated_at=datetime.fromisoformat(updated_at) if updated_at else None
        )
        
        return Response(
            success=True,
            message="Tags retrieved successfully",
            data={"tags": [tag.to_dict() for tag in tags]},
            pagination={"limit": limit, "offset": offset, "total": len(tags)}
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.get("/{tag_id}")
async def get_tag(tag_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific tag by ID."""
    tag_service = TagService(db)
    
    try:
        tag = await tag_service.get(uuid.UUID(tag_id))
        if not tag:
            return Response(
                success=False,
                message="Tag not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Tag retrieved successfully",
            data=tag.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid tag ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.patch("/{tag_id}")
async def update_tag(
    tag_id: str,
    name: Optional[str] = None,
    slug: Optional[str] = None,
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Update a tag."""
    tag_service = TagService(db)
    
    try:
        tag = await tag_service.update(
            uuid.UUID(tag_id),
            name=name,
            slug=slug,
            description=description
        )
        
        if not tag:
            return Response(
                success=False,
                message="Tag not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Tag updated successfully",
            data=tag.to_dict()
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.delete("/{tag_id}")
async def delete_tag(tag_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a tag."""
    tag_service = TagService(db)
    
    try:
        success = await tag_service.delete(uuid.UUID(tag_id))
        
        if not success:
            return Response(
                success=False,
                message="Tag not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Tag deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid tag ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )
