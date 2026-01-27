"""Upload endpoint for CSV files."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from ..services.csv_service import CSVService
from ..services.session_service import SessionService
from ..models.session import WebsiteBatchResponse
from ..config import UPLOADS_DIR, MAX_FILE_SIZE, ALLOWED_EXTENSIONS


router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """
    Upload a CSV file and create a new classification session.
    Returns session_id and first batch of websites.
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    # Save uploaded file
    try:
        file_path = UPLOADS_DIR / f"{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

    # Parse CSV
    try:
        websites = CSVService.parse_csv(file_path)
    except ValueError as e:
        # Clean up file
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Clean up file
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse CSV: {str(e)}"
        )

    # Create session
    try:
        session = SessionService.create_session(websites, file.filename)
    except Exception as e:
        # Clean up file
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create session: {str(e)}"
        )

    # Get first batch of websites
    first_batch = session.websites[:10]

    return {
        "session_id": session.session_id,
        "total_websites": session.total_websites,
        "first_batch": [w.dict() for w in first_batch]
    }
