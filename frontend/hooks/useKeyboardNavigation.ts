/**
 * Hook for handling keyboard navigation (arrow keys and undo).
 */
import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  onLeft: () => void;
  onRight: () => void;
  onUndo: () => void;
  onOpenInNewTab: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onLeft,
  onRight,
  onUndo,
  onOpenInNewTab,
  enabled = true,
}: UseKeyboardNavigationProps) {
  // Global keyboard handler that works even when iframe is focused
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if modifier keys are being used (except for Cmd+Z/Ctrl+Z)
      const isModifierKey = e.ctrlKey || e.altKey || (e.metaKey && e.key !== 'z');

      // Don't handle if typing in an input field on the main page
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Handle arrow keys
      if (e.key === 'ArrowLeft' && !isModifierKey) {
        e.preventDefault();
        e.stopPropagation();
        onLeft();
      } else if (e.key === 'ArrowRight' && !isModifierKey) {
        e.preventDefault();
        e.stopPropagation();
        onRight();
      }
      // Handle Cmd+Z / Ctrl+Z for undo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.stopPropagation();
        onUndo();
      }
      // Handle P key for opening in new tab
      else if (e.key === 'p' && !isModifierKey) {
        e.preventDefault();
        e.stopPropagation();
        onOpenInNewTab();
      }
    };

    // Add listener to window (catches all events including from iframes)
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, onLeft, onRight, onUndo, onOpenInNewTab]);
}
