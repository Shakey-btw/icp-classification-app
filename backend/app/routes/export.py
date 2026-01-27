"""Export endpoint for classified results."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import tempfile

from ..services.session_service import SessionService
from ..services.csv_service import CSVService


router = APIRouter()


@router.get("/export/{session_id}")
async def export_results(session_id: str):
    """Export classification results as CSV."""
    try:
        if not SessionService.session_exists(session_id):
            raise HTTPException(status_code=404, detail="Session not found")

        # Get session
        session = SessionService.get_session(session_id)

        # Create temporary file for export
        temp_file = tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.csv',
            delete=False
        )
        temp_path = Path(temp_file.name)
        temp_file.close()

        # Export to CSV
        CSVService.export_csv(session, temp_path)

        # Generate filename
        original_name = Path(session.csv_filename).stem
        export_filename = f"{original_name}_classified.csv"

        return FileResponse(
            path=temp_path,
            filename=export_filename,
            media_type='text/csv',
            headers={
                "Content-Disposition": f'attachment; filename="{export_filename}"'
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export results: {str(e)}"
        )
