import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiCache } from '../utils/ApiCache';

describe('ApiCache', () => {
  beforeEach(() => {
    apiCache.clearAll();
  });

  describe('get', () => {
    it('should return null when cache is empty', () => {
      const result = apiCache.get('test-key');
      expect(result).toBeNull();
    });

    it('should return cached data when not expired', () => {
      apiCache.set('test-key', { value: 'test-data' }, 1000);
      const result = apiCache.get<{ value: string }>('test-key');
      expect(result).toEqual({ value: 'test-data' });
    });

    it('should return null when cache is expired', () => {
      apiCache.set('test-key', { value: 'test-data' }, 1);
      
      // Wait for cache to expire
      vi.useFakeTimers();
      vi.advanceTimersByTime(2);
      
      const result = apiCache.get('test-key');
      expect(result).toBeNull();
      
      vi.useRealTimers();
    });

    it('should return null for non-existent key', () => {
      apiCache.set('existing-key', 'data');
      const result = apiCache.get('non-existent-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store data in cache', () => {
      apiCache.set('key', 'value');
      const result = apiCache.get('key');
      expect(result).toBe('value');
    });

    it('should overwrite existing cache entry', () => {
      apiCache.set('key', 'first');
      apiCache.set('key', 'second');
      const result = apiCache.get('key');
      expect(result).toBe('second');
    });

    it('should use custom TTL', () => {
      apiCache.set('key', 'value', 100);
      const result = apiCache.get('key');
      expect(result).toBe('value');
    });
  });

  describe('clear', () => {
    it('should remove specific cache entry', () => {
      apiCache.set('key1', 'value1');
      apiCache.set('key2', 'value2');
      apiCache.clear('key1');
      
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toBe('value2');
    });
  });

  describe('clearAll', () => {
    it('should clear all cache entries', () => {
      apiCache.set('key1', 'value1');
      apiCache.set('key2', 'value2');
      apiCache.clearAll();
      
      expect(apiCache.get('key1')).toBeNull();
      expect(apiCache.get('key2')).toBeNull();
    });
  });

  describe('fetchWithCache', () => {
    it('should return cached data if available', async () => {
      apiCache.set('key', 'cached');
      
      const result = await apiCache.fetchWithCache('key', async () => 'fetched');
      expect(result).toBe('cached');
    });

    it('should fetch and cache data when not cached', async () => {
      const result = await apiCache.fetchWithCache('key', async () => 'fetched');
      expect(result).toBe('fetched');
      expect(apiCache.get('key')).toBe('fetched');
    });

    it('should handle fetch errors gracefully', async () => {
      await expect(
        apiCache.fetchWithCache('key', async () => {
          throw new Error('Fetch failed');
        })
      ).rejects.toThrow('Fetch failed');
    });
  });
});