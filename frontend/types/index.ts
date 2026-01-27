/**
 * TypeScript types and interfaces for the ICP Classification app.
 */

export interface Website {
  id: number;
  url: string;
  original_data: Record<string, any>;
}

export interface ClassificationHistory {
  website_id: number;
  classification: 'icp' | 'not_icp';
  timestamp: string;
}

export interface SessionData {
  session_id: string;
  total_websites: number;
  classified_count: number;
  current_index: number;
  classifications: Record<number, 'icp' | 'not_icp'>;
}

export interface UploadResponse {
  session_id: string;
  total_websites: number;
  first_batch: Website[];
}

export interface ClassifyRequest {
  session_id: string;
  website_id: number;
  classification: 'icp' | 'not_icp';
}

export interface ClassifyResponse {
  success: boolean;
  next_index: number;
}

export interface UndoRequest {
  session_id: string;
}

export interface UndoResponse {
  success: boolean;
  previous_index: number;
  restored_classification: string | null;
}

export interface WebsiteBatchResponse {
  websites: Website[];
}

export type ClassificationState = {
  sessionId: string | null;
  websites: Website[];
  currentIndex: number;
  classifications: Record<number, 'icp' | 'not_icp'>;
  history: ClassificationHistory[];
  totalWebsites: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSession: (sessionId: string, websites: Website[], totalWebsites: number) => void;
  classify: (websiteId: number, classification: 'icp' | 'not_icp') => void;
  undo: () => void;
  goToIndex: (index: number) => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};
