from fastapi import APIRouter
from core.utils.response import Response


router = APIRouter(tags=["health"])


@router.get("/")
async def root():
    return Response(success=True, message="Blog API is running", data={"version": "1.0.0"})


@router.get("/health")
async def health_check():
    return Response(success=True, message="Service is healthy", data={"status": "healthy"})
