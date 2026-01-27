/**
 * Hook for preloading websites.
 */
import { useEffect } from 'react';
import { preloader } from '@/lib/preloader';
import type { Website } from '@/types';

export function usePreloader(
  websites: Website[],
  currentIndex: number,
  preloadCount: number = 10
) {
  useEffect(() => {
    // Preload next N websites
    const startIndex = currentIndex;
    const endIndex = Math.min(currentIndex + preloadCount, websites.length);
    const urlsToPreload = websites
      .slice(startIndex, endIndex)
      .map((w) => w.url);

    if (urlsToPreload.length > 0) {
      preloader.preload(urlsToPreload);
    }
  }, [currentIndex, websites, preloadCount]);

  return preloader;
}
