"""Vercel serverless function entry point for FastAPI."""
from app.main import app

# Vercel will use this as the ASGI handler
handler = app
