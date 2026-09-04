from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    app_name: str
    debug: bool


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to verify backend service state."""
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        debug=settings.DEBUG
    )
