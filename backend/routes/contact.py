from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from core.database import get_db
from core.utils.response import Response

router = APIRouter(prefix="/contact", tags=["contact"])


class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str


@router.post("/")
async def submit_contact(
    request: ContactRequest,
    db: AsyncSession = Depends(get_db)
):
    """Submit contact form."""
    # TODO: Implement actual email sending or database storage
    # For now, just return success
    return Response(
        success=True,
        message="Contact form submitted successfully. We'll get back to you soon."
    )
