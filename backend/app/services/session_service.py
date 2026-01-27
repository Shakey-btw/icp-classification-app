"""Session management service."""
import uuid
from pathlib import Path
from typing import List, Tuple, Optional
from datetime import datetime

from ..models.session import Session, Website, Classification
from ..utils.file_handler import FileHandler
from ..config import SESSIONS_DIR


class SessionService:
    """Service for managing classification sessions."""

    @staticmethod
    def create_session(websites: List[Website], csv_filename: str) -> Session:
        """Create a new classification session."""
        session_id = str(uuid.uuid4())
        session = Session(
            session_id=session_id,
            created_at=datetime.now(),
            total_websites=len(websites),
            current_index=0,
            classifications={},
            classification_history=[],
            websites=websites,
            csv_filename=csv_filename
        )

        # Save session to file
        SessionService._save_session(session)
        return session

    @staticmethod
    def get_session(session_id: str) -> Session:
        """Retrieve a session by ID."""
        session_path = SESSIONS_DIR / f"{session_id}.json"
        data = FileHandler.read_json(session_path)
        return Session(**data)

    @staticmethod
    def classify_website(
        session_id: str,
        website_id: int,
        classification: str
    ) -> Tuple[Session, int]:
        """
        Record a classification for a website.
        Returns updated session and next index.
        """
        session = SessionService.get_session(session_id)

        # Create classification record
        classification_record = Classification(
            website_id=website_id,
            classification=classification,
            timestamp=datetime.now()
        )

        # Update session
        session.classifications[website_id] = classification
        session.classification_history.append(classification_record)

        # Update current index
        session.current_index = website_id + 1

        # Save session
        SessionService._save_session(session)

        return session, session.current_index

    @staticmethod
    def undo_classification(session_id: str) -> Tuple[Session, int, Optional[str]]:
        """
        Undo the last classification.
        Returns updated session, previous index, and restored classification.
        """
        session = SessionService.get_session(session_id)

        if not session.classification_history:
            # Nothing to undo
            return session, session.current_index, None

        # Pop last classification from history
        last_classification = session.classification_history.pop()

        # Remove from classifications dict
        if last_classification.website_id in session.classifications:
            del session.classifications[last_classification.website_id]

        # Update current index to the undone website
        session.current_index = last_classification.website_id

        # Save session
        SessionService._save_session(session)

        return session, session.current_index, last_classification.classification

    @staticmethod
    def get_websites_batch(
        session_id: str,
        start_index: int,
        count: int = 10
    ) -> List[Website]:
        """Get a batch of websites from a session."""
        session = SessionService.get_session(session_id)
        end_index = min(start_index + count, len(session.websites))
        return session.websites[start_index:end_index]

    @staticmethod
    def _save_session(session: Session) -> None:
        """Save session to file."""
        session_path = SESSIONS_DIR / f"{session.session_id}.json"
        FileHandler.write_json(session_path, session.dict())

    @staticmethod
    def session_exists(session_id: str) -> bool:
        """Check if a session exists."""
        session_path = SESSIONS_DIR / f"{session_id}.json"
        return session_path.exists()
