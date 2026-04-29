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
    q: Optional[str] = None,
    current_admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """List contact messages (admin only) with optional search query and pagination."""
    # Harden inputs
    try:
        limit = int(limit)
        offset = int(offset)
    except Exception:
        return Response(success=False, message="Invalid pagination parameters", status_code=400)

    if limit < 1 or limit > 500:
        return Response(success=False, message="limit must be between 1 and 500", status_code=400)
    if offset < 0:
        return Response(success=False, message="offset must be >= 0", status_code=400)
    msg_service = ContactService(db)
    messages, total = await msg_service.list(limit=limit, offset=offset, q=q)
    return Response(success=True, message="Messages retrieved", data=[m.to_dict() for m in messages], pagination={"limit": limit, "offset": offset, "total": total})


@router.patch("/{message_id}/read")
async def mark_message_read(message_id: uuid.UUID, current_admin = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Mark a message as read (admin only)."""
    msg_service = ContactService(db)
    try:
        # FastAPI already validated `message_id` as UUID; pass through
        msg = await msg_service.mark_read(message_id)
        if not msg:
            return Response(success=False, message="Message not found", status_code=404)
        return Response(success=True, message="Message marked read", data=msg.to_dict())
    except ValueError:
        return Response(success=False, message="Invalid message ID format", status_code=400)


@router.patch("/mark-all-read")
async def mark_all_read(
    q: Optional[str] = None,
    current_admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Mark all contact messages (or filtered set) as read in a single operation."""
    msg_service = ContactService(db)
    try:
        updated = await msg_service.mark_all_read(q=q)
        return Response(success=True, message=f"Marked {updated} messages as read", data={"updated": updated})
    except Exception as e:
        log_error(f"Failed to mark all read: {e}")
        return Response(success=False, message="Failed to mark messages read", status_code=500)
