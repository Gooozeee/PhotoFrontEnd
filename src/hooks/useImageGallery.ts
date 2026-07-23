import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveApiBaseUrl } from "../lib/apiBaseUrl";
import { getStaticGalleryData } from "./staticGalleryData";

const albumCache = new Map<string, { timestamp: number; data: GalleryAlbum[] }>();
const photoPageCache = new Map<string, { timestamp: number; data: GalleryPhotoPage }>();
const inflightRequests = new Map<string, Promise<unknown>>();
const DEFAULT_PAGE_SIZE = 24;

export interface GalleryPhoto {
  id: string;
  fileName: string;
  albumId: string | null;
  albumName: string | null;
  url: string;
  thumbnailUrl: string | null;
  contentType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  description: string | null;
  takenAt: string;
  importedAt: string;
  location: string | null;
  cameraModel: string | null;
  tags: string[];
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description: string | null;
  coverPhotoId: string | null;
  coverUrl: string | null;
  coverThumbnailUrl: string | null;
  isPublished: boolean;
  photosCount: number;
}

interface GalleryPhotoPage {
  items: GalleryPhoto[];
  offset: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface UseImageGalleryOptions {
  albumName?: string;
  cacheKey?: string;
  cacheTTL?: number;
  includePhotos?: boolean;
  pageSize?: number;
}

const API_BASE = resolveApiBaseUrl();

let serverUnreachable = false;

async function fetchWithTimeout<T>(url: string, timeoutMs = 4000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchJson<T>(url, controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function createScopedKey(cacheKey: string, suffix: string) {
  return `${cacheKey}:${suffix}`;
}

function getAlbumPageCacheKey(cacheKey: string, albumId: string, offset: number, limit: number) {
  return createScopedKey(cacheKey, `album:${albumId}:page:${offset}:limit:${limit}`);
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function getOrCreateCachedRequest<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const created = factory().finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, created);
  return created;
}

export const useImageGallery = ({
  albumName,
  cacheKey = "gallery",
  cacheTTL = 5 * 60 * 1000,
  includePhotos = true,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseImageGalleryOptions) => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const requestIdRef = useRef(0);

  const appendPhotoPage = useCallback((page: GalleryPhotoPage, append: boolean) => {
    setPhotos((current) => {
      if (!append) {
        return page.items;
      }

      const seen = new Set(current.map((photo) => photo.id));
      const nextItems = page.items.filter((photo) => !seen.has(photo.id));
      return [...current, ...nextItems];
    });

    setTotalCount(page.totalCount);
    setHasMore(page.hasMore);
  }, []);

  const getPublishedAlbums = useCallback(async () => {
    const albumsCacheKey = createScopedKey(cacheKey, "published");
    const albumsRequestKey = createScopedKey(cacheKey, "published-albums");
    const cachedAlbums = albumCache.get(albumsCacheKey);

    if (cachedAlbums && Date.now() - cachedAlbums.timestamp < cacheTTL) {
      return cachedAlbums.data;
    }

    return getOrCreateCachedRequest(albumsRequestKey, async () => {
      const items = await fetchWithTimeout<GalleryAlbum[]>(`${API_BASE}/api/albums/published`);
      albumCache.set(albumsCacheKey, { timestamp: Date.now(), data: items });
      return items;
    });
  }, [cacheKey, cacheTTL]);

  const getAlbumPhotoPage = useCallback(async (selectedAlbumId: string, offset: number) => {
    const pageCacheKey = getAlbumPageCacheKey(cacheKey, selectedAlbumId, offset, pageSize);
    const cachedPage = photoPageCache.get(pageCacheKey);

    if (cachedPage && Date.now() - cachedPage.timestamp < cacheTTL) {
      return cachedPage.data;
    }

    return getOrCreateCachedRequest(pageCacheKey, async () => {
      const page = await fetchJson<GalleryPhotoPage>(`${API_BASE}/api/albums/${selectedAlbumId}/photos?offset=${offset}&limit=${pageSize}`);
      photoPageCache.set(pageCacheKey, { timestamp: Date.now(), data: page });
      return page;
    });
  }, [cacheKey, cacheTTL, pageSize]);

  const load = useCallback(async () => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    const normalizedAlbumName = albumName?.trim();

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setAlbumId(null);
    setPhotos([]);
    setHasMore(false);
    setTotalCount(0);

    try {
      let albumsData: GalleryAlbum[];
      let staticFallback = false;

      if (serverUnreachable) {
        const staticData = getStaticGalleryData();
        albumsData = staticData.albums;
        staticFallback = true;
      } else {
        try {
          albumsData = await getPublishedAlbums();
        } catch (err) {
          if (err instanceof TypeError || err instanceof DOMException) {
            serverUnreachable = true;
            const staticData = getStaticGalleryData();
            albumsData = staticData.albums;
            staticFallback = true;
          } else {
            throw err;
          }
        }
      }

      if (requestIdRef.current !== requestId) return;
      setAlbums(albumsData);

      if (!includePhotos) {
        return;
      }

      const album = albumsData.find((item) => item.name.toLowerCase() === normalizedAlbumName.toLowerCase());
      if (!album) {
        setError(`Album "${normalizedAlbumName}" was not found.`);
        return;
      }

      setAlbumId(album.id);

      if (staticFallback) {
        const staticData = getStaticGalleryData();
        const staticPhotos = staticData.photosByAlbum[album.id];
        if (staticPhotos) {
          const page: GalleryPhotoPage = {
            items: staticPhotos,
            offset: 0,
            limit: staticPhotos.length,
            totalCount: staticPhotos.length,
            hasMore: false,
          };
          appendPhotoPage(page, false);
        }
        return;
      }

      const firstPage = await getAlbumPhotoPage(album.id, 0);
      if (requestIdRef.current !== requestId) return;

      appendPhotoPage(firstPage, false);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [albumName, appendPhotoPage, getAlbumPhotoPage, getPublishedAlbums, includePhotos]);

  useEffect(() => {
    void load();
  }, [load]);

  const clearCache = useCallback(() => {
    const scopedPrefix = `${cacheKey}:album:`;
    albumCache.delete(createScopedKey(cacheKey, "published"));

    for (const key of photoPageCache.keys()) {
      if (key.startsWith(scopedPrefix)) {
        photoPageCache.delete(key);
      }
    }
  }, [cacheKey]);

  const loadMore = useCallback(async () => {
    if (!albumId || loading || loadingMore || !hasMore) {
      return;
    }

    const requestId = requestIdRef.current;
    const nextOffset = photos.length;

    setLoadingMore(true);
    setError(null);

    try {
      const page = await getAlbumPhotoPage(albumId, nextOffset);
      if (requestIdRef.current !== requestId) return;

      appendPhotoPage(page, true);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : "Failed to load gallery");
    } finally {
      if (requestIdRef.current === requestId) {
        setLoadingMore(false);
      }
    }
  }, [albumId, appendPhotoPage, getAlbumPhotoPage, hasMore, loading, loadingMore, photos.length]);

  const images = useMemo(
    () =>
      photos.map((photo) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.description?.trim() || null,
        width: photo.width,
        height: photo.height,
        orientation: photo.width < photo.height ? ("portrait" as const) : ("landscape" as const),
        unitWidth: photo.width < photo.height ? 1 : 2,
        unitHeight: photo.width < photo.height ? 2 : 1,
        blurPlaceholder: photo.thumbnailUrl ?? undefined,
      })),
    [photos]
  );

  return {
    images,
    albums,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    clearCache,
  };
};
