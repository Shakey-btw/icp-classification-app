"""Session management service with pluggable storage."""
import uuid
from typing import List, Tuple, Optional
from datetime import datetime

from ..models.session import Session, Website, Classification
from ..storage.factory import storage_backend


class SessionServiceV2:
    """Service for managing classification sessions with async storage."""

    @staticmethod
    async def create_session(websites: List[Website], csv_filename: str) -> Session:
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

        # Save session to storage
        await SessionServiceV2._save_session(session)
        return session

    @staticmethod
    async def get_session(session_id: str) -> Session:
        """Retrieve a session by ID."""
        data = await storage_backend.get(f"session:{session_id}")
        if not data:
            raise FileNotFoundError(f"Session {session_id} not found")
        return Session(**data)

    @staticmethod
    async def classify_website(
        session_id: str,
        website_id: int,
        classification: str
    ) -> Tuple[Session, int]:
        """
        Record a classification for a website.
        Returns updated session and next index.
        """
        session = await SessionServiceV2.get_session(session_id)

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
        await SessionServiceV2._save_session(session)

        return session, session.current_index

    @staticmethod
    async def undo_classification(session_id: str) -> Tuple[Session, int, Optional[str]]:
        """
        Undo the last classification.
        Returns updated session, previous index, and restored classification.
        """
        session = await SessionServiceV2.get_session(session_id)

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
        await SessionServiceV2._save_session(session)

        return session, session.current_index, last_classification.classification

    @staticmethod
    async def get_websites_batch(
        session_id: str,
        start_index: int,
        count: int = 10
    ) -> List[Website]:
        """Get a batch of websites from a session."""
        session = await SessionServiceV2.get_session(session_id)
        end_index = min(start_index + count, len(session.websites))
        return session.websites[start_index:end_index]

    @staticmethod
    async def _save_session(session: Session) -> None:
        """Save session to storage."""
        await storage_backend.set(f"session:{session.session_id}", session.dict())

    @staticmethod
    async def session_exists(session_id: str) -> bool:
        """Check if a session exists."""
        return await storage_backend.exists(f"session:{session_id}")
