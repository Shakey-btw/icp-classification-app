"""Session management endpoints."""
from fastapi import APIRouter, HTTPException, Query

from ..services.session_service import SessionService
from ..models.session import SessionResponse, WebsiteBatchResponse


router = APIRouter()


@router.get("/session/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    """Get session details and progress."""
    try:
        session = SessionService.get_session(session_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve session: {str(e)}"
        )

    return SessionResponse(
        session_id=session.session_id,
        total_websites=session.total_websites,
        classified_count=len(session.classifications),
        current_index=session.current_index,
        classifications=session.classifications
    )


@router.get("/session/{session_id}/websites", response_model=WebsiteBatchResponse)
async def get_websites_batch(
    session_id: str,
    start_index: int = Query(0, ge=0),
    count: int = Query(10, ge=1, le=50)
):
    """Get a batch of websites for classification."""
    try:
        if not SessionService.session_exists(session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        websites = SessionService.get_websites_batch(session_id, start_index, count)

        return WebsiteBatchResponse(websites=websites)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve websites: {str(e)}"
        )
