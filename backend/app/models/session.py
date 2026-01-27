"""Session and Website data models."""
from datetime import datetime
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field


class Website(BaseModel):
    """Represents a single website to be classified."""
    id: int
    url: str
    original_data: Dict[str, Any]


class Classification(BaseModel):
    """Represents a classification action."""
    website_id: int
    classification: str  # "icp" or "not_icp"
    timestamp: datetime = Field(default_factory=datetime.now)


class Session(BaseModel):
    """Represents a classification session."""
    session_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    total_websites: int
    current_index: int = 0
    classifications: Dict[int, str] = Field(default_factory=dict)
    classification_history: List[Classification] = Field(default_factory=list)
    websites: List[Website]
    csv_filename: str


class SessionResponse(BaseModel):
    """Response model for session data."""
    session_id: str
    total_websites: int
    classified_count: int
    current_index: int
    classifications: Dict[int, str]


class WebsiteBatchResponse(BaseModel):
    """Response model for a batch of websites."""
    websites: List[Website]
