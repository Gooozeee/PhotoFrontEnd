import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateImageCaptionFromFilePath } from '../utils/RetrieveNameFromFilePath';

function createPhotoPage(items: Array<Record<string, unknown>>, offset = 0, limit = 24, totalCount = items.length, hasMore = false) {
  return {
    items,
    offset,
    limit,
    totalCount,
    hasMore,
  };
}

describe('generateImageCaptionFromFilePath', () => {
  it('should extract filename and remove extension', () => {
    const result = generateImageCaptionFromFilePath('/assets/Birds/Seagull Northern Ireland 2022.webp');
    expect(result).toBe('Seagull Northern Ireland 2022');
  });

  it('should handle webp extension with space', () => {
    const result = generateImageCaptionFromFilePath('/assets/Test.Image.webp');
    expect(result).toBe('Test.Image');
  });

  it('should handle jpg extension', () => {
    const result = generateImageCaptionFromFilePath('/path/to/photo.jpg');
    expect(result).toBe('photo');
  });

  it('should return filename without path for simple paths', () => {
    const result = generateImageCaptionFromFilePath('image.webp');
    expect(result).toBe('image');
  });

  it('should return the full string when no slash found', () => {
    const result = generateImageCaptionFromFilePath('noextension');
    expect(result).toBe('noextension');
  });
});

describe('useImageGallery', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('loads published albums without fetching album photos when includePhotos is false', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([
        {
          id: 'album-1',
          name: 'Landscapes',
          description: 'Outdoor work',
          coverPhotoId: 'photo-1',
          coverUrl: '/covers/landscapes.jpg',
          coverThumbnailUrl: '/covers/landscapes-thumb.jpg',
          isPublished: true,
          photosCount: 1,
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');

    const { result } = renderHook(() => useImageGallery({ includePhotos: false, cacheTTL: 0 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.albums).toHaveLength(1);
    expect(result.current.images).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/api/albums/published');
  });

  it('loads album photos and maps them into gallery images', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([
        {
          id: 'album-2',
          name: 'Cities',
          description: 'Urban work',
          coverPhotoId: 'photo-2',
          coverUrl: '/covers/cities.jpg',
          coverThumbnailUrl: '/covers/cities-thumb.jpg',
          isPublished: true,
          photosCount: 1,
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify(createPhotoPage([
        {
          id: 'photo-2',
          fileName: 'city.jpg',
          albumId: 'album-2',
          albumName: 'Cities',
          url: '/photos/city.jpg',
          thumbnailUrl: '/photos/city-thumb.jpg',
          contentType: 'image/webp',
          width: 900,
          height: 600,
          fileSizeBytes: 123,
          description: 'Street scene',
          takenAt: '2024-01-01T00:00:00Z',
          importedAt: '2024-01-02T00:00:00Z',
          location: 'Belfast',
          cameraModel: 'Sony',
          tags: ['urban'],
        },
      ])), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');

    const { result } = renderHook(() => useImageGallery({ albumName: 'Cities', cacheTTL: 0 }));

    await waitFor(() => {
      expect(result.current.images).toHaveLength(1);
    });

    expect(result.current.images[0]).toMatchObject({
      id: 'photo-2',
      url: '/photos/city.jpg',
      caption: 'Street scene',
      orientation: 'landscape',
      unitWidth: 2,
      unitHeight: 1,
      blurPlaceholder: '/photos/city-thumb.jpg',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/api/albums/album-2/photos');
  });

  it('prefers the AI caption over the manual description for gallery images', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([
        {
          id: 'album-2',
          name: 'Cities',
          description: 'Urban work',
          coverPhotoId: 'photo-2',
          coverUrl: '/covers/cities.jpg',
          coverThumbnailUrl: '/covers/cities-thumb.jpg',
          isPublished: true,
          photosCount: 1,
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify(createPhotoPage([
        {
          id: 'photo-2',
          fileName: 'city.jpg',
          albumId: 'album-2',
          albumName: 'Cities',
          url: '/photos/city.jpg',
          thumbnailUrl: '/photos/city-thumb.jpg',
          contentType: 'image/webp',
          width: 900,
          height: 600,
          fileSizeBytes: 123,
          description: 'Street scene',
          caption: 'Night-time street with neon lights',
          takenAt: '2024-01-01T00:00:00Z',
          importedAt: '2024-01-02T00:00:00Z',
          location: 'Belfast',
          cameraModel: 'Sony',
          tags: ['urban', 'night'],
        },
      ])), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');

    const { result } = renderHook(() => useImageGallery({ albumName: 'Cities', cacheTTL: 0 }));

    await waitFor(() => {
      expect(result.current.images).toHaveLength(1);
    });

    expect(result.current.images[0]?.caption).toBe('Night-time street with neon lights');
    expect(result.current.images[0]?.tags).toEqual(['urban', 'night']);
  });

  it('loads the next album photo page when loadMore is called', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([
        {
          id: 'album-3',
          name: 'Wildlife',
          description: 'Animals',
          coverPhotoId: 'photo-1',
          coverUrl: '/covers/wildlife.jpg',
          coverThumbnailUrl: '/covers/wildlife-thumb.jpg',
          isPublished: true,
          photosCount: 3,
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify(createPhotoPage([
        {
          id: 'photo-1',
          fileName: 'animal-1.jpg',
          albumId: 'album-3',
          albumName: 'Wildlife',
          url: '/photos/animal-1.jpg',
          thumbnailUrl: '/photos/animal-1-thumb.jpg',
          contentType: 'image/webp',
          width: 900,
          height: 600,
          fileSizeBytes: 123,
          description: 'Animal 1',
          takenAt: '2024-01-01T00:00:00Z',
          importedAt: '2024-01-02T00:00:00Z',
          location: null,
          cameraModel: null,
          tags: [],
        },
        {
          id: 'photo-2',
          fileName: 'animal-2.jpg',
          albumId: 'album-3',
          albumName: 'Wildlife',
          url: '/photos/animal-2.jpg',
          thumbnailUrl: '/photos/animal-2-thumb.jpg',
          contentType: 'image/webp',
          width: 800,
          height: 1200,
          fileSizeBytes: 123,
          description: 'Animal 2',
          takenAt: '2024-01-01T00:00:00Z',
          importedAt: '2024-01-02T00:00:00Z',
          location: null,
          cameraModel: null,
          tags: [],
        },
      ], 0, 2, 3, true)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify(createPhotoPage([
        {
          id: 'photo-3',
          fileName: 'animal-3.jpg',
          albumId: 'album-3',
          albumName: 'Wildlife',
          url: '/photos/animal-3.jpg',
          thumbnailUrl: '/photos/animal-3-thumb.jpg',
          contentType: 'image/webp',
          width: 900,
          height: 600,
          fileSizeBytes: 123,
          description: 'Animal 3',
          takenAt: '2024-01-01T00:00:00Z',
          importedAt: '2024-01-02T00:00:00Z',
          location: null,
          cameraModel: null,
          tags: [],
        },
      ], 2, 2, 3, false)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');

    const { result } = renderHook(() => useImageGallery({ albumName: 'Wildlife', cacheTTL: 0, pageSize: 2 }));

    await waitFor(() => {
      expect(result.current.images).toHaveLength(2);
    });

    expect(result.current.hasMore).toBe(true);
    expect(result.current.totalCount).toBe(3);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.images).toHaveLength(3);
    });

    expect(result.current.hasMore).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain('/api/albums/album-3/photos?offset=2&limit=2');
  });

  it('returns an error when the albums request fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 500 }));
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');
    const { configureDiscoveryRetry } = await import('../lib/discoveryApi');
    configureDiscoveryRetry({ retries: 0 });

    const { result } = renderHook(() => useImageGallery({ cacheTTL: 0 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Request failed with 500');
  });

  it('returns an error when the requested album does not exist', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      {
        id: 'album-2',
        name: 'Cities',
        description: 'Urban work',
        coverPhotoId: 'photo-2',
        coverUrl: '/covers/cities.jpg',
        coverThumbnailUrl: '/covers/cities-thumb.jpg',
        isPublished: true,
        photosCount: 1,
      },
    ]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');

    const { result } = renderHook(() => useImageGallery({ albumName: 'Missing', cacheTTL: 0 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Album "Missing" was not found.');
    expect(result.current.images).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not fall back to the filename when a photo has no description', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([
        {
          id: 'album-2',
          name: 'Cities',
          description: 'Urban work',
          coverPhotoId: 'photo-2',
          coverUrl: '/covers/cities.jpg',
          coverThumbnailUrl: '/covers/cities-thumb.jpg',
          isPublished: true,
          photosCount: 1,
        },
      ]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify(createPhotoPage([
        {
          id: 'photo-2',
          fileName: 'IMG_7886.jpg',
          albumId: 'album-2',
          albumName: 'Cities',
          url: '/photos/city.jpg',
          thumbnailUrl: '/photos/city-thumb.jpg',
          contentType: 'image/webp',
          width: 900,
          height: 600,
          fileSizeBytes: 123,
          description: null,
          takenAt: '2024-01-01T00:00:00Z',
          importedAt: '2024-01-02T00:00:00Z',
          location: 'Belfast',
          cameraModel: 'Sony',
          tags: ['urban'],
        },
      ])), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    const { useImageGallery } = await import('./useImageGallery');

    const { result } = renderHook(() => useImageGallery({ albumName: 'Cities', cacheTTL: 0 }));

    await waitFor(() => {
      expect(result.current.images).toHaveLength(1);
    });

    expect(result.current.images[0]?.caption).toBeNull();
  });
});
