"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .routes import upload, session, classification, export, proxy


# Create FastAPI app
app = FastAPI(
    title="ICP Classification API",
    description="API for classifying websites as ICP or Not ICP",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(session.router, prefix="/api", tags=["session"])
app.include_router(classification.router, prefix="/api", tags=["classification"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(proxy.router, prefix="/api", tags=["proxy"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "ICP Classification API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
