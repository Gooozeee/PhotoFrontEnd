import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GalleryAlbum, GalleryPhoto } from '../../hooks/useImageGallery';
import { buildSeries, fetchArchiveSeries, fetchSeriesImages, getStaticSeries, useArchiveSeries } from './useArchiveSeries';

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
    photosCount: 1,
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
      makeAlbum({ id: 'empty', name: 'Empty', photosCount: 0 }),
      makeAlbum({ id: 'large', name: 'Large', photosCount: 2 }),
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

  it('builds the live archive from albums without loading every photo', async () => {
    fetchWithRetryMock.mockResolvedValue([makeAlbum()]);

    const series = await fetchArchiveSeries();

    expect(fetchWithRetryMock).toHaveBeenCalledTimes(1);
    expect(series[0]?.images).toEqual([]);
    expect(series[0]?.cover).toBe('/cover.jpg');
  });

  it('fetches album photos from the live API when a series opens', async () => {
    fetchWithRetryMock.mockResolvedValue([makePhoto('a', '/a.jpg', '2022-01-01T00:00:00Z')]);

    const images = await fetchSeriesImages('album-1');

    expect(images).toEqual(['/a.jpg']);
  });

  it('loads all album photos from the unpaged endpoint', async () => {
    fetchWithRetryMock.mockImplementation(async (url: string) => {
      expect(url).not.toContain('offset=');
      return [
        makePhoto('a', '/a.jpg', '2022-01-01T00:00:00Z'),
        makePhoto('b', '/b.jpg', '2023-01-01T00:00:00Z'),
      ];
    });

    const images = await fetchSeriesImages('album-1');

    expect(images).toEqual(['/a.jpg', '/b.jpg']);
  });

  it('loads live data in the hook and reports a failure without static images', async () => {
    fetchWithRetryMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/albums/published')) {
        return [makeAlbum({ id: 'live', name: 'Live album' })];
      }
      return [makePhoto('l', '/live.jpg', '2022-01-01T00:00:00Z')];
    });

    const live = renderHook(() => useArchiveSeries());
    await waitFor(() => expect(live.result.current.loading).toBe(false));
    expect(live.result.current.series.some((item) => item.id === 'live')).toBe(true);

    fetchWithRetryMock.mockRejectedValue(new TypeError('network'));
    const failed = renderHook(() => useArchiveSeries());
    await waitFor(() => expect(failed.result.current.loading).toBe(false));
    expect(failed.result.current.error).toContain('Could not reach the archive');
    expect(failed.result.current.series).toEqual([]);
  });

  it('retries after a failed connection', async () => {
    fetchWithRetryMock
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce([makeAlbum({ id: 'live', name: 'Live album' })]);

    const hook = renderHook(() => useArchiveSeries());
    await waitFor(() => expect(hook.result.current.error).not.toBeNull());

    act(() => hook.result.current.retry());

    await waitFor(() => expect(hook.result.current.series.some((item) => item.id === 'live')).toBe(true));
    expect(hook.result.current.error).toBeNull();
  });
});
