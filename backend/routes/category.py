from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid
from datetime import datetime
from core.database import get_db
from services.category import CategoryService
from core.utils.response import Response

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/")
async def create_category(
    name: str,
    slug: str,
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Create a new category."""
    category_service = CategoryService(db)
    
    try:
        category = await category_service.create(
            name=name,
            slug=slug,
            description=description
        )
        return Response(
            success=True,
            message="Category created successfully",
            data=category.to_dict(),
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
            message=f"Failed to create category: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get("/")
async def list_categories(
    search_query: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    created_at: Optional[str] = None,
    updated_at: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List categories with optional search and pagination."""
    category_service = CategoryService(db)
    
    try:
        categories = await category_service.list(
            search_query=search_query,
            limit=limit,
            offset=offset,
            created_at=datetime.fromisoformat(created_at) if created_at else None,
            updated_at=datetime.fromisoformat(updated_at) if updated_at else None
        )
        
        return Response(
            success=True,
            message="Categories retrieved successfully",
            data={"categories": [category.to_dict() for category in categories]},
            pagination={"limit": limit, "offset": offset, "total": len(categories)}
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.get("/{category_id}")
async def get_category(category_id: Optional[str] = None, slug: Optional[str] = None, name: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """Get a specific category by ID, slug, or name."""
    category_service = CategoryService(db)
    
    try:
        category = await category_service.get(
            uuid.UUID(category_id) if category_id else None,
            slug=slug,
            name=name
        )
        if not category:
            return Response(
                success=False,
                message="Category not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Category retrieved successfully",
            data=category.to_dict()
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.patch("/{category_id}")
async def update_category(
    category_id: str,
    name: Optional[str] = None,
    slug: Optional[str] = None,
    description: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Update a category."""
    category_service = CategoryService(db)
    
    try:
        category = await category_service.update(
            uuid.UUID(category_id),
            name=name,
            slug=slug,
            description=description
        )
        
        if not category:
            return Response(
                success=False,
                message="Category not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Category updated successfully",
            data=category.to_dict()
        )
    except ValueError as e:
        return Response(
            success=False,
            message=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.delete("/{category_id}")
async def delete_category(category_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a category."""
    category_service = CategoryService(db)
    
    try:
        success = await category_service.delete(uuid.UUID(category_id))
        
        if not success:
            return Response(
                success=False,
                message="Category not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="Category deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid category ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )
