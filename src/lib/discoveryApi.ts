import { resolveApiBaseUrl } from "./apiBaseUrl";

export interface DiscoveryPhoto {
  id: string;
  fileName: string;
  albumId: string | null;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  description: string | null;
  rating: number | null;
  width: number;
  height: number;
  tags: string[];
}

const API_BASE = resolveApiBaseUrl();

async function fetchWithTimeout<T>(url: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export function getHighlights(limit = 12): Promise<DiscoveryPhoto[]> {
  return fetchWithTimeout<DiscoveryPhoto[]>(`${API_BASE}/api/photos/highlights?limit=${limit}`);
}

export function getSimilarPhotos(photoId: string, limit = 8): Promise<DiscoveryPhoto[]> {
  return fetchWithTimeout<DiscoveryPhoto[]>(`${API_BASE}/api/photos/${photoId}/similar?limit=${limit}`);
}

export function searchPhotos(query: string, limit = 24): Promise<DiscoveryPhoto[]> {
  return fetchWithTimeout<DiscoveryPhoto[]>(
    `${API_BASE}/api/photos/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
}
