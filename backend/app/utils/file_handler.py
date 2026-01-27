"""File handling utilities with atomic writes."""
import json
import fcntl
from pathlib import Path
from typing import Any


class FileHandler:
    """Handler for atomic file operations."""

    @staticmethod
    def write_json(file_path: Path, data: Any) -> None:
        """Write JSON data to file with atomic operation and file locking."""
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Write to temporary file first
        temp_path = file_path.with_suffix('.tmp')

        try:
            with open(temp_path, 'w') as f:
                # Acquire exclusive lock
                fcntl.flock(f.fileno(), fcntl.LOCK_EX)
                try:
                    json.dump(data, f, indent=2, default=str)
                    f.flush()
                finally:
                    # Release lock
                    fcntl.flock(f.fileno(), fcntl.LOCK_UN)

            # Atomic rename
            temp_path.replace(file_path)

        except Exception as e:
            # Clean up temp file if it exists
            if temp_path.exists():
                temp_path.unlink()
            raise e

    @staticmethod
    def read_json(file_path: Path) -> Any:
        """Read JSON data from file with file locking."""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, 'r') as f:
            # Acquire shared lock for reading
            fcntl.flock(f.fileno(), fcntl.LOCK_SH)
            try:
                data = json.load(f)
            finally:
                # Release lock
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)

        return data
