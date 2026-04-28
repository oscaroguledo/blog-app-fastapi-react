from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.utils.response import Response
from services.contact import ContactService
from routes.user import get_current_admin
from typing import Optional
from datetime import datetime
import uuid
import traceback
from core.utils.logger import error as log_error

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/")
async def submit_contact(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Submit contact form and store message."""
    data = await request.json()
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")

    msg_service = ContactService(db)
    try:
        msg = await msg_service.create(name=name, email=email, subject=subject, message=message)
        return Response(
            success=True,
            message="Contact form submitted successfully",
            data=msg.to_dict(),
            status_code=status.HTTP_201_CREATED
        )
    except ValueError as e:
        return Response(success=False, message=str(e), status_code=400)
    except Exception as e:
        # Log full traceback for easier debugging
        tb = traceback.format_exc()
        log_error(f"Failed to submit contact: {e}\n{tb}")
        return Response(success=False, message="Failed to submit contact", status_code=500)


@router.get("/")
async def list_messages(
    limit: int = 100,
    offset: int = 0,
    current_admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List contact messages (admin only)."""
    msg_service = ContactService(db)
    messages = await msg_service.list(limit=limit, offset=offset)
    return Response(success=True, message="Messages retrieved", data=[m.to_dict() for m in messages], pagination={"limit": limit, "offset": offset, "total": len(messages)})


@router.patch("/{message_id}/read")
async def mark_message_read(message_id: str, current_admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Mark a message as read (admin only)."""
    msg_service = ContactService(db)
    try:
        msg = await msg_service.mark_read(uuid.UUID(message_id))
        if not msg:
            return Response(success=False, message="Message not found", status_code=404)
        return Response(success=True, message="Message marked read", data=msg.to_dict())
    except ValueError:
        return Response(success=False, message="Invalid message ID format", status_code=400)
