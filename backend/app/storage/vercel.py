"""Vercel storage backends (for production)."""
import json
import os
from typing import Optional, Any
import redis.asyncio as redis
from .base import StorageBackend, FileStorageBackend


class VercelKVBackend(StorageBackend):
    """Upstash Redis storage for sessions (via Vercel Marketplace)."""

    def __init__(self):
        # Check for Upstash Redis connection (Vercel Marketplace integration)
        # Upstash provides these env vars when connected via Vercel
        redis_url = (
            os.getenv("KV_URL") or
            os.getenv("REDIS_URL") or
            os.getenv("UPSTASH_REDIS_REST_URL") or
            os.getenv("KV_REST_API_URL") or
            os.getenv("STORAGE_URL")
        )

        if not redis_url:
            raise ValueError(
                "Redis credentials not found. Please connect Upstash Redis "
                "from Vercel Storage → Marketplace"
            )

        # Connect to Upstash Redis
        self.client = redis.from_url(
            redis_url,
            decode_responses=True
        )

    async def get(self, key: str) -> Optional[Any]:
        """Get value by key."""
        try:
            value = await self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"KV get error: {e}")
            return None

    async def set(self, key: str, value: Any) -> None:
        """Set value for key."""
        try:
            await self.client.set(key, json.dumps(value, default=str))
        except Exception as e:
            print(f"KV set error: {e}")
            raise

    async def delete(self, key: str) -> None:
        """Delete key."""
        try:
            await self.client.delete(key)
        except Exception as e:
            print(f"KV delete error: {e}")

    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        try:
            return await self.client.exists(key) > 0
        except Exception as e:
            print(f"KV exists error: {e}")
            return False


class VercelBlobBackend(FileStorageBackend):
    """Vercel Blob storage for file uploads."""

    def __init__(self):
        # For Vercel Blob, we'll use the REST API
        self.blob_token = os.getenv("BLOB_READ_WRITE_TOKEN")
        if not self.blob_token:
            raise ValueError("Vercel Blob token not found in environment")

        # Blob store URL
        self.blob_url = "https://blob.vercel-storage.com"

    async def upload(self, file_path: str, content: bytes) -> str:
        """Upload file to Vercel Blob and return URL."""
        import httpx

        headers = {
            "Authorization": f"Bearer {self.blob_token}",
            "Content-Type": "application/octet-stream"
        }

        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{self.blob_url}/{file_path}",
                content=content,
                headers=headers
            )
            response.raise_for_status()
            result = response.json()
            return result.get("url", file_path)

    async def download(self, file_path: str) -> bytes:
        """Download file from Vercel Blob."""
        import httpx

        # If file_path is already a URL, use it directly
        if file_path.startswith("http"):
            url = file_path
        else:
            url = f"{self.blob_url}/{file_path}"

        headers = {
            "Authorization": f"Bearer {self.blob_token}"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.content

    async def delete(self, file_path: str) -> None:
        """Delete file from Vercel Blob."""
        import httpx

        headers = {
            "Authorization": f"Bearer {self.blob_token}"
        }

        async with httpx.AsyncClient() as client:
            await client.delete(
                f"{self.blob_url}/{file_path}",
                headers=headers
            )

    async def exists(self, file_path: str) -> bool:
        """Check if file exists in Vercel Blob."""
        import httpx

        headers = {
            "Authorization": f"Bearer {self.blob_token}"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.head(
                    f"{self.blob_url}/{file_path}",
                    headers=headers
                )
                return response.status_code == 200
            except:
                return False
