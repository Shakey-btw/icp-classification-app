import Papa from 'papaparse';

interface Website {
  id: number;
  url: string;
  original_data: Record<string, any>;
}

interface ParseResult {
  websites: Website[];
  urlColumn: string;
  totalRows: number;
}

/**
 * Parse CSV file and extract websites
 */
export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as Record<string, any>[];

          if (data.length === 0) {
            reject(new Error('CSV file is empty'));
            return;
          }

          // Detect URL column
          const urlColumn = detectURLColumn(data[0]);
          if (!urlColumn) {
            reject(new Error('No URL column found. Please ensure your CSV has a column with URLs'));
            return;
          }

          // Extract websites
          const websites: Website[] = data
            .filter(row => {
              if (!row[urlColumn]) return false;
              const normalized = normalizeURL(row[urlColumn]);
              // Filter out invalid URLs (empty, has spaces, or doesn't look like a domain)
              return normalized &&
                     !normalized.includes(' ') &&
                     /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(normalized);
            })
            .map((row, index) => ({
              id: index,
              url: normalizeURL(row[urlColumn]),
              original_data: row,
            }));

          if (websites.length === 0) {
            const skippedCount = data.length - websites.length;
            reject(new Error(`No valid URLs found in CSV. ${skippedCount} rows were skipped because they don't contain valid website URLs (found company names or invalid data instead).`));
            return;
          }

          // Log info about skipped rows
          const skippedCount = data.length - websites.length;
          if (skippedCount > 0) {
            console.warn(`Skipped ${skippedCount} rows with invalid URLs out of ${data.length} total rows`);
          }

          resolve({
            websites,
            urlColumn,
            totalRows: websites.length,
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Detect which column contains URLs
 */
function detectURLColumn(firstRow: Record<string, any>): string | null {
  const validColumnNames = [
    'website url',
    'domain',
    'website',
    'domain url',
    'website link'
  ];

  // Check for exact matches (case-insensitive)
  for (const key of Object.keys(firstRow)) {
    const lowerKey = key.toLowerCase().trim();
    if (validColumnNames.includes(lowerKey)) {
      return key;
    }
  }

  // Check if any value looks like a URL
  for (const [key, value] of Object.entries(firstRow)) {
    if (typeof value === 'string' && isURL(value)) {
      return key;
    }
  }

  return null;
}

/**
 * Check if a string looks like a URL
 */
function isURL(str: string): boolean {
  try {
    const url = new URL(str.startsWith('http') ? str : `https://${str}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalize URL (add https:// if missing)
 */
function normalizeURL(url: string): string {
  url = url.trim();

  // Decode URL-encoded strings (e.g., "bora%20vertriebs" -> "bora vertriebs")
  try {
    url = decodeURIComponent(url);
  } catch {
    // If decoding fails, use original string
  }

  // Remove any spaces (in case it's a company name)
  url = url.replace(/\s+/g, '');

  // If it still has non-URL characters after cleanup, it's likely not a valid URL
  if (!url || url.includes(' ') || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(url.replace(/^https?:\/\//, ''))) {
    return url; // Return as-is, will be filtered out
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Export session data to CSV
 */
export function exportToCSV(
  websites: Website[],
  classifications: Record<number, 'icp' | 'not_icp'>,
  industries: Record<number, string>,
  filename: string
): void {
  // Add ICP classification and Industry columns to original data
  const exportData = websites.map(website => {
    const row: Record<string, any> = {
      ...website.original_data,
    };

    // Add ICP classification if exists
    if (classifications[website.id]) {
      row.ICP_Classification = classifications[website.id] === 'icp' ? 'ICP' : 'NOT ICP';
    }

    // Add Industry if exists
    if (industries[website.id]) {
      row.Industry = industries[website.id];
    }

    return row;
  });

  // Convert to CSV
  const csv = Papa.unparse(exportData);

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace('.csv', '')}_classified.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
