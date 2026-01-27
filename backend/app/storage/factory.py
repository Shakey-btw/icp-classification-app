"""Storage factory for automatic backend selection."""
import os
from .base import StorageBackend, FileStorageBackend
from .local import LocalStorageBackend, LocalFileStorageBackend
from .vercel import VercelKVBackend, VercelBlobBackend
from ..config import SESSIONS_DIR, UPLOADS_DIR


def get_storage_backend() -> StorageBackend:
    """Get appropriate storage backend based on environment."""
    # Check if we're running on Vercel
    is_vercel = os.getenv("VERCEL") == "1"

    if is_vercel and os.getenv("KV_REST_API_URL"):
        # Use Vercel KV in production
        return VercelKVBackend()
    else:
        # Use local file storage in development
        return LocalStorageBackend(SESSIONS_DIR)


def get_file_storage_backend() -> FileStorageBackend:
    """Get appropriate file storage backend based on environment."""
    # Check if we're running on Vercel
    is_vercel = os.getenv("VERCEL") == "1"

    if is_vercel and os.getenv("BLOB_READ_WRITE_TOKEN"):
        # Use Vercel Blob in production
        return VercelBlobBackend()
    else:
        # Use local file storage in development
        return LocalFileStorageBackend(UPLOADS_DIR)


# Global instances
storage_backend = get_storage_backend()
file_storage_backend = get_file_storage_backend()
