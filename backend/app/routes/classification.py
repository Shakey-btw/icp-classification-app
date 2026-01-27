"""Classification endpoints."""
from fastapi import APIRouter, HTTPException

from ..services.session_service import SessionService
from ..models.classification import (
    ClassifyRequest,
    ClassifyResponse,
    UndoRequest,
    UndoResponse
)


router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
async def classify_website(request: ClassifyRequest):
    """Record a classification decision."""
    try:
        if not SessionService.session_exists(request.session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        session, next_index = SessionService.classify_website(
            request.session_id,
            request.website_id,
            request.classification
        )

        return ClassifyResponse(
            success=True,
            next_index=next_index
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to classify website: {str(e)}"
        )


@router.post("/undo", response_model=UndoResponse)
async def undo_classification(request: UndoRequest):
    """Undo the last classification."""
    try:
        if not SessionService.session_exists(request.session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        session, previous_index, restored = SessionService.undo_classification(
            request.session_id
        )

        if restored is None:
            raise HTTPException(
                status_code=400,
                detail="No classification to undo"
            )

        return UndoResponse(
            success=True,
            previous_index=previous_index,
            restored_classification=restored
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to undo classification: {str(e)}"
        )
