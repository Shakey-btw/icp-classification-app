"""CSV parsing and export service."""
import pandas as pd
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..models.session import Website, Session


class CSVService:
    """Service for handling CSV operations."""

    @staticmethod
    def detect_url_column(df: pd.DataFrame) -> Optional[str]:
        """Detect which column contains URLs."""
        # Common URL column names
        url_column_names = [
            "url", "URL", "Url", "website", "Website", "WEBSITE",
            "domain", "Domain", "DOMAIN", "link", "Link", "LINK"
        ]

        # Check for exact matches first
        for col in df.columns:
            if col in url_column_names:
                return col

        # Check for partial matches
        for col in df.columns:
            col_lower = str(col).lower()
            if any(name.lower() in col_lower for name in url_column_names):
                return col

        # Check first column if it contains URL-like strings
        if len(df.columns) > 0:
            first_col = df.columns[0]
            # Check if values look like URLs
            sample_values = df[first_col].head(5).astype(str)
            if sample_values.str.contains(r"https?://|www\.", regex=True).any():
                return first_col

        return None

    @staticmethod
    def parse_csv(file_path: Path) -> List[Website]:
        """Parse CSV file and extract websites."""
        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            raise ValueError(f"Failed to parse CSV: {str(e)}")

        if df.empty:
            raise ValueError("CSV file is empty")

        # Detect URL column
        url_column = CSVService.detect_url_column(df)
        if not url_column:
            raise ValueError(
                "No URL column found in CSV. Please ensure your CSV has a column "
                "named 'url', 'URL', 'website', 'domain', or similar."
            )

        websites = []
        for idx, row in df.iterrows():
            url = str(row[url_column]).strip()
            if not url or url.lower() in ["nan", "none", ""]:
                continue  # Skip empty URLs

            # Ensure URL has protocol
            if not url.startswith(("http://", "https://")):
                url = "https://" + url

            websites.append(Website(
                id=len(websites),
                url=url,
                original_data=row.to_dict()
            ))

        if not websites:
            raise ValueError("No valid URLs found in CSV")

        return websites

    @staticmethod
    def export_csv(session: Session, output_path: Path) -> None:
        """Export session data to CSV with classifications."""
        # Create DataFrame from original data
        df = pd.DataFrame([w.original_data for w in session.websites])

        # Add classification column
        classifications = []
        for i in range(len(session.websites)):
            classification = session.classifications.get(i, "")
            if classification:
                classifications.append("ICP" if classification == "icp" else "NOT ICP")
            else:
                classifications.append("")

        df["ICP_Classification"] = classifications

        # Save to CSV
        df.to_csv(output_path, index=False)
