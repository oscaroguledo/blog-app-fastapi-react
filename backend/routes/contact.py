from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.utils.response import Response

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/")
async def submit_contact(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Submit contact form."""
    data = await request.json()
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")
    
    # TODO: Implement actual email sending or database storage
    # For now, just return success
    return Response(
        success=True,
        message="Contact form submitted successfully. We'll get back to you soon."
    )
