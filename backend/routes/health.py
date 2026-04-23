from fastapi import APIRouter


router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Blog API is running", "version": "1.0.0"}


@router.get("/health")
async def health_check():
    return {"status": "healthy"}
