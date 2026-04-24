from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from services.user import UserService
from models.user import UserRole
import uuid

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    """Dependency to get the current authenticated user from JWT token."""
    token = credentials.credentials
    user_service = UserService(db)
    
    token_payload = await user_service.verify_token(token)
    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = token_payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user = await user_service.get(uuid.UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_admin(
    current_user = Depends(get_current_user)
):
    """Dependency to ensure the current user is an admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
async def get_current_writer(
    current_user = Depends(get_current_user)
):
    """Dependency to ensure the current user is a writer or admin."""
    if current_user.role not in {UserRole.WRITER, UserRole.ADMIN}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Writer privileges required"
        )
    return current_user

async def get_current_editor(
    current_user = Depends(get_current_user)
):
    """Dependency to ensure the current user is an editor or admin."""
    if current_user.role not in {UserRole.EDITOR, UserRole.ADMIN}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editor privileges required"
        )
    return current_user