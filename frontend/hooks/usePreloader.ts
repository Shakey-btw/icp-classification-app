/**
 * Hook for preloading websites.
 */
import { useEffect } from 'react';
import { preloader } from '@/lib/preloader';

export function usePreloader(
  urls: string[],
  currentIndex: number,
  preloadCount: number = 15
) {
  useEffect(() => {
    // Preload current website + next N websites ahead
    // This ensures smooth navigation without waiting for loads
    const startIndex = currentIndex;
    const endIndex = Math.min(currentIndex + preloadCount, urls.length);
    const urlsToPreload = urls.slice(startIndex, endIndex);

    if (urlsToPreload.length > 0) {
      console.log(`[usePreloader] Preloading ${urlsToPreload.length} websites starting from index ${currentIndex}`);
      preloader.preload(urlsToPreload);
    }
  }, [currentIndex, urls, preloadCount]);

  return preloader;
}
