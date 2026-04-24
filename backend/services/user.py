from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from models.user import User, UserRole
from typing import Optional, List
from datetime import datetime
import uuid
from core.utils.encryption.password import password_handler
from core.utils.encryption.jwt import jwt_handler


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        firstName: str,
        lastName: str,
        email: str,
        password: str,
        role: UserRole = UserRole.READER,
        avatar: Optional[str] = None,
        bio: Optional[str] = None
    ) -> User:
        """Create a new user."""
        if not email:
            raise ValueError("Email is required")
        if not password:
            raise ValueError("Password is required")
        if not firstName:
            raise ValueError("First name is required")
        if not lastName:
            raise ValueError("Last name is required")
        hashed_password = password_handler.hash_password(password)
        # Accept string role and convert to enum
        if isinstance(role, str):
            role_map = {r.value.lower(): r for r in UserRole}
            role = role_map.get(role.lower(), UserRole.READER)
        user = User(
            firstName=firstName,
            lastName=lastName,
            email=email,
            password=hashed_password,
            role=role.value,
            avatar=avatar,
            bio=bio
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def create_access_token(self, user: User) -> str:
        """Create a JWT access token for a user."""
        token_data = {
            "id": str(user.id),
            "email": user.email,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "role": user.role if isinstance(user.role, str) else user.role.value,
            "active": user.active
        }
        return jwt_handler.create_access_token(token_data)

    async def create_refresh_token(self, user: User) -> str:
        """Create a JWT refresh token for a user."""
        token_data = {
            "id": str(user.id),
            "email": user.email
        }
        return jwt_handler.create_refresh_token(token_data)

    async def refresh_tokens(self, refresh_token: str) -> Optional[tuple[User, str, str]]:
        """Refresh access and refresh tokens using a valid refresh token."""
        if not refresh_token:
            raise ValueError("Refresh token is required")
        
        payload = jwt_handler.verify_token(refresh_token)
        if not payload:
            return None, None, None
        
        # Verify it's a refresh token
        if payload.get("type") != "refresh":
            return None, None, None
        
        user_id = payload.get("id")
        if not user_id:
            return None, None, None
        
        user = await self.get(uuid.UUID(user_id))
        if not user or not user.active:
            return None, None, None
        
        access_token = await self.create_access_token(user)
        new_refresh_token = await self.create_refresh_token(user)
        
        return user, access_token, new_refresh_token

    async def login(self, email: str, password: str) -> Optional[tuple[User, str, str]]:
        """Authenticate a user and return the user with access and refresh tokens."""
        if not email:
            raise ValueError("Email is required")
        if not password:
            raise ValueError("Password is required")
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            return None, None, None
        
        if not password_handler.verify_password(password, user.password):
            return None, None, None
        
        if not user.active:
            return None, None, None
        
        access_token = await self.create_access_token(user)
        refresh_token = await self.create_refresh_token(user)
        return user, access_token, refresh_token

    async def verify_token(self, token: str) -> Optional[dict]:
        """Verify a JWT token and return the user ID if valid."""
        if not token:
            raise ValueError("Token is required")
        return jwt_handler.verify_token(token)
    
    async def get(self, user_id: Optional[uuid.UUID] = None, email:Optional[str] = None) -> Optional[User]:
        """Get a user by ID or email."""
        if not user_id and not email:
            raise ValueError("User ID or email is required")
        
        query = select(User)
        if user_id:
            query = query.where(User.id == user_id)
        if email:
            query = query.where(User.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    

    async def list(self, 
        active: Optional[bool] = None,
        role: Optional[UserRole] = None,
        firstName: Optional[str] = None,
        lastName: Optional[str] = None,
        email: Optional[str] = None,
        user_id: Optional[uuid.UUID] = None,
        start_at: Optional[datetime] = None,
        end_at: Optional[datetime] = None,
        limit: int = 100, 
        offset: int = 0) -> List[User]:
            """Get all users with pagination."""
            query = select(User)
            conditions = []
            
            if active is not None:
                conditions.append(User.active == active)
            if role is not None:
                role_val = role.value if isinstance(role, UserRole) else role
                conditions.append(User.role == role_val)
            if firstName is not None:
                conditions.append(User.firstName == firstName)
            if lastName is not None:
                conditions.append(User.lastName == lastName)
            if email is not None:
                conditions.append(User.email == email)
            if user_id is not None:
                conditions.append(User.id == user_id)
            if start_at is not None:
                conditions.append(User.created_at >= start_at)
            if end_at is not None:
                conditions.append(User.created_at <= end_at)
            
            if conditions:
                query = query.where(and_(*conditions))
            
            query = query.offset(offset).limit(limit)
            result = await self.db.execute(query)
            return result.scalars().all()

    async def update(
        self,
        user_id: uuid.UUID,
        email: Optional[str] = None,
        firstName: Optional[str] = None,
        lastName: Optional[str] = None,
        avatar: Optional[str] = None,
        bio: Optional[str] = None,
        role: Optional[UserRole] = None) -> Optional[User]:
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
                user.role = role.value if isinstance(role, UserRole) else role
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

    def generate_signed_token(self, payload: dict, expires_hours: int = 24) -> str:
        """Generate a short-lived signed JWT for email verification / password reset."""
        from datetime import timedelta
        return jwt_handler.create_access_token(payload, expires_delta=timedelta(hours=expires_hours))
    
