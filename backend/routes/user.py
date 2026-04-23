from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime
from core.database import get_db
from services.user import UserService
from core.utils.response import Response
from models.user import UserRole

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=Response)
async def register(
    firstName: str,
    lastName: str,
    email: EmailStr,
    password: str,
    role: Optional[str] = "Reader",
    avatar: Optional[str] = None,
    bio: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user."""
    user_service = UserService(db)
    
    # Check if user already exists
    existing_user = await user_service.get(user_id=None, email=email)
    if existing_user:
        return Response(
            success=False,
            message="User with this email already exists",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    try:
        user = await user_service.create(
            firstName=firstName,
            lastName=lastName,
            email=email,
            password=password,
            role=role,
            avatar=avatar,
            bio=bio
        )
        return Response(
            success=True,
            message="User registered successfully",
            data=user.to_dict(),
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            success=False,
            message=f"Failed to register user: {str(e)}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.post("/login", response_model=Response)
async def login(
    email: EmailStr,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    """Login user and return JWT token."""
    user_service = UserService(db)
    
    user, token = await user_service.login(email, password)
    
    if not user:
        return Response(
            success=False,
            message="Invalid email or password",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    return Response(
        success=True,
        message="Login successful",
        data={
            "user": user.to_dict(),
            "token_type": "Bearer",
            "access_token": token
        }
    )


@router.get("/me", response_model=Response)
async def get_current_user(token: str, db: AsyncSession = Depends(get_db)):
    """Get current user from JWT token."""
    user_service = UserService(db)
    
    user_id = await user_service.verify_token(token)
    if not user_id:
        return Response(
            success=False,
            message="Invalid or expired token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    user = await user_service.get(uuid.UUID(user_id))
    if not user:
        return Response(
            success=False,
            message="User not found",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    return Response(
        success=True,
        message="User retrieved successfully",
        data=user.to_dict()
    )


@router.get("/", response_model=Response)
async def list_users(
    active: Optional[bool] = None,
    role: Optional[str] = None,
    firstName: Optional[str] = None,
    lastName: Optional[str] = None,
    email: Optional[str] = None,
    user_id: Optional[str] = None,
    created_at: Optional[datetime] = None,
    updated_at: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """List all users with pagination."""
    user_service = UserService(db)
    
    users = await user_service.list(
        active=active,
        role=role,
        firstName=firstName,
        lastName=lastName,
        email=email,
        user_id=user_id,
        created_at=created_at,
        updated_at=updated_at,
        limit=limit,
        offset=offset
    )
    
    return Response(
        success=True,
        message="Users retrieved successfully",
        data={"users": [user.to_dict() for user in users]},
        pagination={"limit": limit, "offset": offset, "total": len(users)}
    )


@router.get("/{user_id}", response_model=Response)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific user by ID."""
    user_service = UserService(db)
    
    try:
        user = await user_service.get(uuid.UUID(user_id))
        if not user:
            return Response(
                success=False,
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="User retrieved successfully",
            data=user.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid user ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.patch("/{user_id}", response_model=Response)
async def update_user(
    user_id: str,
    email: Optional[str] = None,
    firstName: Optional[str] = None,
    lastName: Optional[str] = None,
    avatar: Optional[str] = None,
    bio: Optional[str] = None,
    role: Optional[UserRole] = None,
    db: AsyncSession = Depends(get_db)
):
    """Update a user."""
    user_service = UserService(db)
    
    try:
        user = await user_service.update(
            uuid.UUID(user_id),
            email=email,
            firstName=firstName,
            lastName=lastName,
            avatar=avatar,
            bio=bio,
            role=role
        )
        
        if not user:
            return Response(
                success=False,
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="User updated successfully",
            data=user.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid user ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.delete("/{user_id}", response_model=Response)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a user."""
    user_service = UserService(db)
    
    try:
        success = await user_service.delete(uuid.UUID(user_id))
        
        if not success:
            return Response(
                success=False,
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="User deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid user ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{user_id}/activate", response_model=Response)
async def activate_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Activate a user account."""
    user_service = UserService(db)
    
    try:
        user = await user_service.activate(uuid.UUID(user_id))
        
        if not user:
            return Response(
                success=False,
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="User activated successfully",
            data=user.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid user ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )


@router.post("/{user_id}/deactivate", response_model=Response)
async def deactivate_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Deactivate a user account."""
    user_service = UserService(db)
    
    try:
        user = await user_service.deactivate(uuid.UUID(user_id))
        
        if not user:
            return Response(
                success=False,
                message="User not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        return Response(
            success=True,
            message="User deactivated successfully",
            data=user.to_dict()
        )
    except ValueError:
        return Response(
            success=False,
            message="Invalid user ID format",
            status_code=status.HTTP_400_BAD_REQUEST
        )
