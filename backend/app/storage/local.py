"""Local file-based storage (for development)."""
import json
import aiofiles
from pathlib import Path
from typing import Optional, Any
from .base import StorageBackend, FileStorageBackend
from ..utils.file_handler import FileHandler


class LocalStorageBackend(StorageBackend):
    """Local JSON file storage for sessions."""

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def get(self, key: str) -> Optional[Any]:
        """Get value by key."""
        file_path = self.base_path / f"{key}.json"
        if not file_path.exists():
            return None
        try:
            return FileHandler.read_json(file_path)
        except Exception:
            return None

    async def set(self, key: str, value: Any) -> None:
        """Set value for key."""
        file_path = self.base_path / f"{key}.json"
        FileHandler.write_json(file_path, value)

    async def delete(self, key: str) -> None:
        """Delete key."""
        file_path = self.base_path / f"{key}.json"
        if file_path.exists():
            file_path.unlink()

    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        file_path = self.base_path / f"{key}.json"
        return file_path.exists()


class LocalFileStorageBackend(FileStorageBackend):
    """Local file storage for uploads."""

    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.base_path.mkdir(parents=True, exist_ok=True)

    async def upload(self, file_path: str, content: bytes) -> str:
        """Upload file and return path."""
        full_path = self.base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(full_path, 'wb') as f:
            await f.write(content)

        return str(full_path)

    async def download(self, file_path: str) -> bytes:
        """Download file content."""
        full_path = self.base_path / file_path
        async with aiofiles.open(full_path, 'rb') as f:
            return await f.read()

    async def delete(self, file_path: str) -> None:
        """Delete file."""
        full_path = self.base_path / file_path
        if full_path.exists():
            full_path.unlink()

    async def exists(self, file_path: str) -> bool:
        """Check if file exists."""
        full_path = self.base_path / file_path
        return full_path.exists()
