"""Application configuration settings."""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Data directories
DATA_DIR = BASE_DIR / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
UPLOADS_DIR = DATA_DIR / "uploads"

# Ensure directories exist
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# File upload settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".csv"}

# Session settings
SESSION_TTL_DAYS = 7

# Proxy settings
PROXY_TIMEOUT = 10  # seconds
MAX_RESPONSE_SIZE = 5 * 1024 * 1024  # 5MB

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
