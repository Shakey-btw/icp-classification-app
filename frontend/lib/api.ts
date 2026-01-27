/**
 * API client functions for communicating with the backend.
 */
import type {
  UploadResponse,
  SessionData,
  WebsiteBatchResponse,
  ClassifyRequest,
  ClassifyResponse,
  UndoRequest,
  UndoResponse,
} from '@/types';

// Use environment variable if set, otherwise use relative path (works with Next.js rewrites)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class APIClient {
  /**
   * Upload a CSV file and create a new session.
   */
  static async uploadCSV(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload CSV');
    }

    return response.json();
  }

  /**
   * Get session details.
   */
  static async getSession(sessionId: string): Promise<SessionData> {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to get session');
    }

    return response.json();
  }

  /**
   * Get a batch of websites.
   */
  static async getWebsitesBatch(
    sessionId: string,
    startIndex: number,
    count: number = 10
  ): Promise<WebsiteBatchResponse> {
    const response = await fetch(
      `${API_BASE_URL}/session/${sessionId}/websites?start_index=${startIndex}&count=${count}`
    );

    if (!response.ok) {
      throw new Error('Failed to get websites batch');
    }

    return response.json();
  }

  /**
   * Record a classification.
   */
  static async classify(request: ClassifyRequest): Promise<ClassifyResponse> {
    const response = await fetch(`${API_BASE_URL}/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to classify website');
    }

    return response.json();
  }

  /**
   * Undo last classification.
   */
  static async undo(request: UndoRequest): Promise<UndoResponse> {
    const response = await fetch(`${API_BASE_URL}/undo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to undo classification');
    }

    return response.json();
  }

  /**
   * Get export URL for downloading results.
   */
  static getExportURL(sessionId: string): string {
    return `${API_BASE_URL}/export/${sessionId}`;
  }

  /**
   * Get proxy URL for a website.
   */
  static getProxyURL(url: string): string {
    return `${API_BASE_URL}/proxy?url=${encodeURIComponent(url)}`;
  }
}
