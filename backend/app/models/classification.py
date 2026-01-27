"""Classification request and response models."""
from pydantic import BaseModel, Field
from typing import Literal, Optional


class ClassifyRequest(BaseModel):
    """Request model for classifying a website."""
    session_id: str
    website_id: int
    classification: Literal["icp", "not_icp"]


class ClassifyResponse(BaseModel):
    """Response model for classification."""
    success: bool
    next_index: int


class UndoRequest(BaseModel):
    """Request model for undoing a classification."""
    session_id: str


class UndoResponse(BaseModel):
    """Response model for undo action."""
    success: bool
    previous_index: int
    restored_classification: Optional[str] = None
