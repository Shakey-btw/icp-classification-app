"""Website fetching and proxying service."""
import httpx
from urllib.parse import urljoin, urlparse
import re
from typing import Tuple
from ..config import PROXY_TIMEOUT, MAX_RESPONSE_SIZE


class WebsiteService:
    """Service for fetching and proxying websites."""

    @staticmethod
    async def fetch_website(url: str) -> Tuple[str, str]:
        """
        Fetch website content and prepare it for iframe embedding.
        Returns (html_content, content_type).
        """
        # Validate URL
        if not url.startswith(("http://", "https://")):
            raise ValueError("Invalid URL: must start with http:// or https://")

        async with httpx.AsyncClient(
            timeout=PROXY_TIMEOUT,
            follow_redirects=True
        ) as client:
            try:
                response = await client.get(url)
                response.raise_for_status()

                # Check content size
                content_length = len(response.content)
                if content_length > MAX_RESPONSE_SIZE:
                    raise ValueError(
                        f"Response too large: {content_length} bytes "
                        f"(max: {MAX_RESPONSE_SIZE})"
                    )

                content_type = response.headers.get("content-type", "text/html")
                html_content = response.text

                # Rewrite relative URLs to absolute
                html_content = WebsiteService._rewrite_urls(html_content, url)

                return html_content, content_type

            except httpx.TimeoutException:
                raise ValueError(f"Request timeout: {url}")
            except httpx.HTTPError as e:
                raise ValueError(f"HTTP error: {str(e)}")

    @staticmethod
    def _rewrite_urls(html: str, base_url: str) -> str:
        """Rewrite relative URLs to absolute URLs."""
        parsed_base = urlparse(base_url)
        base_origin = f"{parsed_base.scheme}://{parsed_base.netloc}"

        # Rewrite href attributes
        html = re.sub(
            r'href=["\'](?!http|//|#|mailto:|tel:)([^"\']+)["\']',
            lambda m: f'href="{urljoin(base_url, m.group(1))}"',
            html
        )

        # Rewrite src attributes
        html = re.sub(
            r'src=["\'](?!http|//|data:)([^"\']+)["\']',
            lambda m: f'src="{urljoin(base_url, m.group(1))}"',
            html
        )

        # Rewrite action attributes (forms)
        html = re.sub(
            r'action=["\'](?!http|//)([^"\']+)["\']',
            lambda m: f'action="{urljoin(base_url, m.group(1))}"',
            html
        )

        return html
