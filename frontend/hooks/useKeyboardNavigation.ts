/**
 * Hook for handling keyboard navigation (arrow keys and undo).
 */
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface UseKeyboardNavigationProps {
  onLeft: () => void;
  onRight: () => void;
  onUndo: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onLeft,
  onRight,
  onUndo,
  enabled = true,
}: UseKeyboardNavigationProps) {
  // Arrow key handlers
  useHotkeys(
    'left',
    (e) => {
      e.preventDefault();
      onLeft();
    },
    { enabled },
    [onLeft, enabled]
  );

  useHotkeys(
    'right',
    (e) => {
      e.preventDefault();
      onRight();
    },
    { enabled },
    [onRight, enabled]
  );

  // Undo handler (Cmd+Z or Ctrl+Z)
  useHotkeys(
    'mod+z',
    (e) => {
      e.preventDefault();
      onUndo();
    },
    { enabled },
    [onUndo, enabled]
  );

  // Prevent default browser navigation on arrow keys
  useEffect(() => {
    if (!enabled) return;

    const preventDefaults = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefaults);
    return () => window.removeEventListener('keydown', preventDefaults);
  }, [enabled]);
}
