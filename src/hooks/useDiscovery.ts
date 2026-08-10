import { useEffect, useRef, useState } from "react";
import { getHighlights, getSimilarPhotos, isNetworkError, searchPhotos, type DiscoveryPhoto } from "../lib/discoveryApi";
import { getStaticGalleryData } from "./staticGalleryData";

const TTL = 5 * 60 * 1000;
const MAX_QUERY_LENGTH = 120;
const cache = new Map<string, { timestamp: number; data: DiscoveryPhoto[] }>();
const inflight = new Map<string, Promise<unknown>>();

async function fetchCached<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = factory().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}

function useReconnectToken() {
  const [token, setToken] = useState(0);

  useEffect(() => {
    const refresh = () => setToken((current) => current + 1);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return token;
}

export interface UseDiscoveryState {
  photos: DiscoveryPhoto[];
  loading: boolean;
  error: string | null;
}

export function useHighlights(limit = 12): UseDiscoveryState {
  const [photos, setPhotos] = useState<DiscoveryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const failedKeysRef = useRef(new Set<string>());
  const reconnectToken = useReconnectToken();

  useEffect(() => {
    const cacheKey = `highlights:${limit}`;
    const cached = failedKeysRef.current.has(cacheKey) && reconnectToken > 0 ? undefined : cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setPhotos(cached.data);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    let stale = false;

    fetchCached(cacheKey, () => getHighlights(limit))
      .then((data) => {
        if (stale || requestId !== requestIdRef.current) return;
        cache.set(cacheKey, { timestamp: Date.now(), data });
        failedKeysRef.current.delete(cacheKey);
        setPhotos(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (stale || requestId !== requestIdRef.current) return;

        if (isNetworkError(err)) {
          failedKeysRef.current.add(cacheKey);
          const staticData = getStaticGalleryData();
          const fallback = Object.values(staticData.photosByAlbum)
            .flat()
            .slice(0, limit)
            .map(staticToDiscovery);
          setPhotos(fallback);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load highlights");
        }
      })
      .finally(() => {
        if (!stale && requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [limit, reconnectToken]);

  return { photos, loading, error };
}

export function useSimilarPhotos(photoId: string | null): UseDiscoveryState {
  const [photos, setPhotos] = useState<DiscoveryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const failedKeysRef = useRef(new Set<string>());
  const reconnectToken = useReconnectToken();

  useEffect(() => {
    if (!photoId) {
      setPhotos([]);
      setLoading(false);
      setError(null);
      return;
    }

    const cacheKey = `similar:${photoId}`;
    const cached = failedKeysRef.current.has(cacheKey) && reconnectToken > 0 ? undefined : cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setPhotos(cached.data);
      return;
    }

    const requestId = ++requestIdRef.current;
    let stale = false;
    setLoading(true);

    fetchCached(cacheKey, () => getSimilarPhotos(photoId))
      .then((data) => {
        if (stale || requestId !== requestIdRef.current) return;
        cache.set(cacheKey, { timestamp: Date.now(), data });
        failedKeysRef.current.delete(cacheKey);
        setPhotos(data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (stale || requestId !== requestIdRef.current) return;
        if (isNetworkError(err)) {
          failedKeysRef.current.add(cacheKey);
        } else {
          failedKeysRef.current.delete(cacheKey);
          setError(err instanceof Error ? err.message : "Failed to load similar photos");
        }
      })
      .finally(() => {
        if (!stale && requestId === requestIdRef.current) setLoading(false);
      });

    return () => {
      stale = true;
    };
  }, [photoId, reconnectToken]);

  return { photos, loading, error };
}

export interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

export function usePhotoSearch(query: string, { debounceMs = 350, minQueryLength = 2 }: UseSearchOptions = {}) {
  const [results, setResults] = useState<DiscoveryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const failedKeysRef = useRef(new Set<string>());
  const reconnectToken = useReconnectToken();

  const normalized = query.trim().slice(0, MAX_QUERY_LENGTH);

  useEffect(() => {
    if (normalized.length < minQueryLength) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const cacheKey = `search:${normalized.toLowerCase()}`;
    const cached = failedKeysRef.current.has(cacheKey) && reconnectToken > 0 ? undefined : cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < TTL) {
      setResults(cached.data);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;
    let stale = false;

    const timer = setTimeout(() => {
      fetchCached(cacheKey, () => searchPhotos(normalized))
        .then((data) => {
          if (stale || requestId !== requestIdRef.current) return;
          cache.set(cacheKey, { timestamp: Date.now(), data });
          failedKeysRef.current.delete(cacheKey);
          setResults(data);
          setError(null);
        })
        .catch((err: unknown) => {
          if (stale || requestId !== requestIdRef.current) return;

          if (isNetworkError(err)) {
            failedKeysRef.current.add(cacheKey);
            const staticData = getStaticGalleryData();
            const needle = normalized.toLowerCase();
            const fallback = Object.values(staticData.photosByAlbum)
              .flat()
              .filter((photo) => photo.fileName.toLowerCase().includes(needle) || (photo.caption ?? "").toLowerCase().includes(needle))
              .map(staticToDiscovery);
            setResults(fallback);
            setError(null);
          } else {
            failedKeysRef.current.delete(cacheKey);
            setError(err instanceof Error ? err.message : "Search failed");
          }
        })
        .finally(() => {
          if (!stale && requestId === requestIdRef.current) setLoading(false);
        });
    }, debounceMs);

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [normalized, debounceMs, minQueryLength, reconnectToken]);

  return { results, loading, error, searched: normalized.length >= minQueryLength };
}

function staticToDiscovery(photo: {
  id: string;
  fileName: string;
  albumId: string | null;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  description: string | null;
  width: number;
  height: number;
  tags: string[];
}): DiscoveryPhoto {
  return {
    id: photo.id,
    fileName: photo.fileName,
    albumId: photo.albumId,
    albumName: null,
    url: photo.url,
    thumbnailUrl: photo.thumbnailUrl,
    caption: photo.caption,
    description: photo.description,
    rating: null,
    width: photo.width,
    height: photo.height,
    tags: photo.tags,
  };
}
