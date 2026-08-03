import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const photo = (id: string, caption = 'caption') => ({
  id,
  fileName: `${id}.jpg`,
  albumId: null,
  url: `/${id}.webp`,
  thumbnailUrl: null,
  caption,
  description: null,
  rating: 8,
  width: 800,
  height: 600,
  tags: [],
});

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('useDiscovery hooks', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  describe('useHighlights', () => {
    it('loads highlights from the API', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse([photo('h1'), photo('h2')]));
      vi.stubGlobal('fetch', fetchMock);
      const { useHighlights } = await import('./useDiscovery');

      const { result } = renderHook(() => useHighlights(10));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.photos).toHaveLength(2);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/photos/highlights?limit=10'),
        expect.anything()
      );
    });

    it('falls back to static data when the server is unreachable', async () => {
      const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      vi.stubGlobal('fetch', fetchMock);
      const { useHighlights } = await import('./useDiscovery');

      const { result } = renderHook(() => useHighlights(10));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.photos.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useSimilarPhotos', () => {
    it('does not fetch when photoId is null', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      const { useSimilarPhotos } = await import('./useDiscovery');

      const { result } = renderHook(() => useSimilarPhotos(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.photos).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('loads similar photos for a photo id', async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse([photo('s1')]));
      vi.stubGlobal('fetch', fetchMock);
      const { useSimilarPhotos } = await import('./useDiscovery');

      const { result } = renderHook(() => useSimilarPhotos('p1'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.photos).toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/photos/p1/similar?limit=8'),
        expect.anything()
      );
    });
  });

  describe('usePhotoSearch', () => {
    it('returns empty results for a short query', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      const { usePhotoSearch } = await import('./useDiscovery');

      const { result } = renderHook(() => usePhotoSearch('a'));

      expect(result.current.results).toEqual([]);
      expect(result.current.searched).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('searches the API for a valid query (debounced)', async () => {
      vi.useFakeTimers();
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse([photo('r1', 'Snow')]));
      vi.stubGlobal('fetch', fetchMock);
      const { usePhotoSearch } = await import('./useDiscovery');

      const { result } = renderHook(() => usePhotoSearch('snow'));

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.results).toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/photos/search?q=snow&limit=24'),
        expect.anything()
      );
      vi.useRealTimers();
    });
  });
});
