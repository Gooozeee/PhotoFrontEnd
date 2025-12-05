/**
 * Simple cache utility for API responses
 * Reduces repeated API calls by storing responses locally
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Get cached data if it exists and hasn't expired
   * @param key - Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with optional TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 1 hour)
   */
  set<T>(key: string, data: T, ttl: number = 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Fetch with automatic caching
   * @param key - Cache key
   * @param fetchFn - Async function that fetches data
   * @param ttl - Time to live in milliseconds
   */
  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 60 * 60 * 1000
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached) return cached;

    // Fetch if not cached
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

// Export singleton instance
export const apiCache = new ApiCache();
