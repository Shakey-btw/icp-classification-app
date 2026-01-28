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
            .filter(row => row[urlColumn])
            .map((row, index) => ({
              id: index,
              url: normalizeURL(row[urlColumn]),
              original_data: row,
            }));

          if (websites.length === 0) {
            reject(new Error('No valid URLs found in CSV'));
            return;
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
  const urlKeywords = ['url', 'website', 'domain', 'link', 'site'];

  // Check column names
  for (const key of Object.keys(firstRow)) {
    const lowerKey = key.toLowerCase();
    if (urlKeywords.some(keyword => lowerKey.includes(keyword))) {
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
  filename: string
): void {
  // Add ICP classification column to original data
  const exportData = websites.map(website => ({
    ...website.original_data,
    ICP_Classification: classifications[website.id]
      ? classifications[website.id] === 'icp'
        ? 'ICP'
        : 'NOT ICP'
      : '',
  }));

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
