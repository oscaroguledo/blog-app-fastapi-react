from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.user import User, UserRole
from typing import Optional, List
import uuid


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        firstName: str,
        lastName: str,
        email: str,
        role: UserRole = UserRole.READER,
        avatar: Optional[str] = None,
        bio: Optional[str] = None
    ) -> User:
        """Create a new user."""
        user = User(
            firstName=firstName,
            lastName=lastName,
            email=email,
            role=role,
            avatar=avatar,
            bio=bio
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def get(self, user_id: uuid.UUID, email:str = None) -> Optional[User]:
        """Get a user by ID."""
        query = select(User).where(User.id == user_id)
        if email:
            query = query.options(selectinload(User.email))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list(self, 
        active: Optional[bool] = None,
        role: Optional[UserRole] = None,
        firstName: Optional[str] = None,
        lastName: Optional[str] = None,
        email: Optional[str] = None,
        user_id: Optional[uuid.UUID] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        limit: int = 100, 
        offset: int = 0) -> List[User]:
            """Get all users with pagination."""
            result = await self.db.execute(
                select(User).where(
                    User.active == active,
                    User.role == role,
                    User.firstName == firstName,
                    User.lastName == lastName,
                    User.email == email,
                    User.id == user_id,
                    User.created_at == created_at,
                    User.updated_at == updated_at
                )
                .offset(offset)
                .limit(limit)
            )
            return result.scalars().all()

    async def update(
        self,
        user_id: uuid.UUID,
        email: Optional[str] = None,
        firstName: Optional[str] = None,
        lastName: Optional[str] = None,
        avatar: Optional[str] = None,
        bio: Optional[str] = None,
        role: Optional[UserRole] = None
    ) -> Optional[User]:
        """Update a user."""
        user = await self.get(user_id, email)
        if not user:
            return None
        
        if firstName is not None:
            user.firstName = firstName
        if lastName is not None:
            user.lastName = lastName
        if avatar is not None:
            user.avatar = avatar
        if bio is not None:
            user.bio = bio
        if role is not None:
            user.role = role
        if email is not None:
            user.email = email
        
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: uuid.UUID) -> bool:
        """Delete a user."""
        user = await self.get(user_id)
        if not user:
            return False
        
        await self.db.delete(user)
        await self.db.commit()
        return True

    async def activate(self, user_id: uuid.UUID) -> Optional[User]:
        """Activate a user."""
        user = await self.get(user_id)
        if not user:
            return None
        
        user.active = True
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def deactivate(self, user_id: uuid.UUID) -> Optional[User]:
        """Deactivate a user."""
        user = await self.get(user_id)
        if not user:
            return None
        
        user.active = False
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
