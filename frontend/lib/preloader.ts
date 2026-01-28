/**
 * Website preloader for smooth navigation experience.
 */
export class WebsitePreloader {
  private preloadedContent: Map<string, string> = new Map();
  private loading: Set<string> = new Set();
  private maxCacheSize: number = 20;

  /**
   * Preload a batch of websites.
   */
  async preload(urls: string[]): Promise<void> {
    const promises = urls.map((url) => this.preloadSingle(url));
    await Promise.allSettled(promises);
  }

  /**
   * Preload a single website.
   */
  private async preloadSingle(url: string): Promise<void> {
    // Skip if already loaded or loading
    if (this.preloadedContent.has(url) || this.loading.has(url)) {
      return;
    }

    this.loading.add(url);

    try {
      const proxyURL = `/api/proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyURL);

      if (response.ok) {
        const html = await response.text();
        this.set(url, html);
      }
    } catch (error) {
      console.error(`Failed to preload ${url}:`, error);
    } finally {
      this.loading.delete(url);
    }
  }

  /**
   * Get preloaded content for a URL.
   */
  get(url: string): string | null {
    return this.preloadedContent.get(url) || null;
  }

  /**
   * Set preloaded content for a URL.
   */
  private set(url: string, content: string): void {
    // Implement LRU eviction if cache is full
    if (this.preloadedContent.size >= this.maxCacheSize) {
      const firstKey = this.preloadedContent.keys().next().value;
      if (firstKey) {
        this.preloadedContent.delete(firstKey);
      }
    }

    this.preloadedContent.set(url, content);
  }

  /**
   * Clear all preloaded content.
   */
  clear(): void {
    this.preloadedContent.clear();
    this.loading.clear();
  }

  /**
   * Check if a URL is currently being loaded.
   */
  isLoading(url: string): boolean {
    return this.loading.has(url);
  }

  /**
   * Check if a URL is preloaded.
   */
  isPreloaded(url: string): boolean {
    return this.preloadedContent.has(url);
  }
}

// Singleton instance
export const preloader = new WebsitePreloader();
