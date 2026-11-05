import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GalleryAlbum, GalleryPhoto } from '../../hooks/useImageGallery';
import { buildSeries, fetchArchiveSeries, getStaticSeries, useArchiveSeries } from './useArchiveSeries';

const fetchWithRetryMock = vi.hoisted(() => vi.fn());

vi.mock('../../lib/discoveryApi', () => ({
  fetchWithRetry: fetchWithRetryMock,
  isNetworkError: () => true,
}));

function makeAlbum(overrides: Partial<GalleryAlbum> = {}): GalleryAlbum {
  return {
    id: 'album-1',
    name: 'Album',
    description: 'Album description',
    coverPhotoId: null,
    coverUrl: '/cover.jpg',
    coverThumbnailUrl: null,
    isPublished: true,
    photosCount: 0,
    ...overrides,
  };
}

function makePhoto(id: string, url: string, takenAt: string): GalleryPhoto {
  return {
    id,
    fileName: `${id}.webp`,
    albumId: 'album-1',
    albumName: 'Album',
    url,
    thumbnailUrl: null,
    contentType: 'image/webp',
    width: 1200,
    height: 800,
    fileSizeBytes: 100,
    description: null,
    caption: null,
    takenAt,
    importedAt: takenAt,
    location: null,
    cameraModel: null,
    tags: [],
  };
}

describe('archive series', () => {
  beforeEach(() => {
    fetchWithRetryMock.mockReset();
  });

  it('builds series from live albums and photos', () => {
    const albums = [makeAlbum()];
    const photos = [
      makePhoto('a', '/a.jpg', '2022-01-01T00:00:00Z'),
      makePhoto('b', '/b.jpg', '2024-01-01T00:00:00Z'),
    ];

    const series = buildSeries(albums, { 'album-1': photos });

    expect(series).toHaveLength(1);
    expect(series[0]).toMatchObject({
      id: 'album-1',
      title: 'Album',
      place: 'Album description',
      cover: '/cover.jpg',
      year: '2022—2024',
      images: ['/a.jpg', '/b.jpg'],
    });
  });

  it('uses the first photo when an album has no cover', () => {
    const series = buildSeries([makeAlbum({ coverUrl: null })], {
      'album-1': [makePhoto('a', '/a.jpg', '2022-01-01T00:00:00Z')],
    });

    expect(series[0]?.cover).toBe('/a.jpg');
  });

  it('drops empty albums and sorts by image count', () => {
    const albums = [
      makeAlbum({ id: 'small', name: 'Small' }),
      makeAlbum({ id: 'empty', name: 'Empty' }),
      makeAlbum({ id: 'large', name: 'Large' }),
    ];

    const series = buildSeries(albums, {
      small: [makePhoto('s1', '/s1.jpg', '2022-01-01T00:00:00Z')],
      empty: [],
      large: [
        makePhoto('l1', '/l1.jpg', '2022-01-01T00:00:00Z'),
        makePhoto('l2', '/l2.jpg', '2023-01-01T00:00:00Z'),
      ],
    });

    expect(series.map((item) => item.id)).toEqual(['large', 'small']);
  });

  it('falls back to the bundled archive with unique covers and images', () => {
    const series = getStaticSeries();

    expect(series.length).toBeGreaterThan(0);
    expect(new Set(series.map((item) => item.cover)).size).toBe(series.length);

    for (const item of series) {
      expect(new Set(item.images).size).toBe(item.images.length);
    }
  });

  it('fetches album photos from the live API', async () => {
    fetchWithRetryMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/albums/published')) return [makeAlbum()];
      if (url.includes('/api/albums/album-1/photos')) {
        return { items: [makePhoto('a', '/a.jpg', '2022-01-01T00:00:00Z')], hasMore: false, totalCount: 1 };
      }
      throw new Error(`Unexpected URL ${url}`);
    });

    const series = await fetchArchiveSeries();

    expect(series[0]?.images).toEqual(['/a.jpg']);
  });

  it('paginates album photos until hasMore is false', async () => {
    let page = 0;
    fetchWithRetryMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/albums/published')) return [makeAlbum()];
      page += 1;
      return page === 1
        ? { items: [makePhoto('a', '/a.jpg', '2022-01-01T00:00:00Z')], hasMore: true, totalCount: 2 }
        : { items: [makePhoto('b', '/b.jpg', '2023-01-01T00:00:00Z')], hasMore: false, totalCount: 2 };
    });

    const series = await fetchArchiveSeries();

    expect(page).toBe(2);
    expect(series[0]?.images).toEqual(['/a.jpg', '/b.jpg']);
  });

  it('loads live data in the hook and keeps the local archive on failure', async () => {
    fetchWithRetryMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/albums/published')) {
        return [makeAlbum({ id: 'live', name: 'Live album' })];
      }
      return { items: [makePhoto('l', '/live.jpg', '2022-01-01T00:00:00Z')], hasMore: false, totalCount: 1 };
    });

    const live = renderHook(() => useArchiveSeries());
    await waitFor(() => expect(live.result.current.loading).toBe(false));
    expect(live.result.current.series.some((item) => item.id === 'live')).toBe(true);

    fetchWithRetryMock.mockRejectedValue(new TypeError('network'));
    const failed = renderHook(() => useArchiveSeries());
    await waitFor(() => expect(failed.result.current.loading).toBe(false));
    expect(failed.result.current.error).toContain('Backend unavailable');
    expect(failed.result.current.series.length).toBeGreaterThan(0);
  });
});
