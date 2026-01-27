"""Proxy endpoint for fetching websites."""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse

from ..services.website_service import WebsiteService


router = APIRouter()


@router.get("/proxy")
async def proxy_website(url: str = Query(..., description="URL to fetch")):
    """
    Proxy a website to handle CORS and iframe embedding issues.
    Fetches the website and returns modified HTML.
    """
    try:
        html_content, content_type = await WebsiteService.fetch_website(url)

        return HTMLResponse(
            content=html_content,
            headers={
                "Content-Type": content_type,
                "X-Frame-Options": "ALLOWALL",
                "Content-Security-Policy": "frame-ancestors *",
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch website: {str(e)}"
        )
