/**
 * Zustand store for managing classification state.
 */
import { create } from 'zustand';
import type { ClassificationState, Website, ClassificationHistory } from '@/types';

export const useClassificationStore = create<ClassificationState>((set, get) => ({
  // Initial state
  sessionId: null,
  websites: [],
  currentIndex: 0,
  classifications: {},
  history: [],
  totalWebsites: 0,
  isLoading: false,
  error: null,

  // Actions
  setSession: (sessionId, websites, totalWebsites) => {
    set({
      sessionId,
      websites,
      totalWebsites,
      currentIndex: 0,
      classifications: {},
      history: [],
      isLoading: false,
      error: null,
    });
  },

  classify: (websiteId, classification) => {
    const state = get();

    // Add to history
    const historyEntry: ClassificationHistory = {
      website_id: websiteId,
      classification,
      timestamp: new Date().toISOString(),
    };

    // Update classifications and history
    set({
      classifications: {
        ...state.classifications,
        [websiteId]: classification,
      },
      history: [...state.history, historyEntry],
      currentIndex: websiteId + 1,
    });
  },

  undo: () => {
    const state = get();

    if (state.history.length === 0) {
      return; // Nothing to undo
    }

    // Pop last history entry
    const newHistory = [...state.history];
    const lastEntry = newHistory.pop();

    if (!lastEntry) return;

    // Remove classification
    const newClassifications = { ...state.classifications };
    delete newClassifications[lastEntry.website_id];

    // Update state
    set({
      classifications: newClassifications,
      history: newHistory,
      currentIndex: lastEntry.website_id,
    });
  },

  goToIndex: (index) => {
    set({ currentIndex: index });
  },

  reset: () => {
    set({
      sessionId: null,
      websites: [],
      currentIndex: 0,
      classifications: {},
      history: [],
      totalWebsites: 0,
      isLoading: false,
      error: null,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));
