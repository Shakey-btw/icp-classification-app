"""Base storage interface."""
from abc import ABC, abstractmethod
from typing import Optional, Any


class StorageBackend(ABC):
    """Abstract base class for storage backends."""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Get value by key."""
        pass

    @abstractmethod
    async def set(self, key: str, value: Any) -> None:
        """Set value for key."""
        pass

    @abstractmethod
    async def delete(self, key: str) -> None:
        """Delete key."""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        pass


class FileStorageBackend(ABC):
    """Abstract base class for file storage backends."""

    @abstractmethod
    async def upload(self, file_path: str, content: bytes) -> str:
        """Upload file and return URL."""
        pass

    @abstractmethod
    async def download(self, file_path: str) -> bytes:
        """Download file content."""
        pass

    @abstractmethod
    async def delete(self, file_path: str) -> None:
        """Delete file."""
        pass

    @abstractmethod
    async def exists(self, file_path: str) -> bool:
        """Check if file exists."""
        pass
