import { resolveApiBaseUrl } from "./apiBaseUrl";

export interface DiscoveryPhoto {
  id: string;
  fileName: string;
  albumId: string | null;
  albumName?: string | null;
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

interface RetryOptions {
  retries: number;
  baseDelayMs: number;
}

class TransientRequestError extends Error {
  constructor(status: number) {
    super(`Request failed with ${status}`);
    this.name = "TransientRequestError";
  }
}

let retryOptions: RetryOptions = { retries: 2, baseDelayMs: 750 };

export function configureDiscoveryRetry(options: Partial<RetryOptions>) {
  const retries = Number.isFinite(options.retries) ? Math.floor(options.retries as number) : retryOptions.retries;
  const baseDelayMs = Number.isFinite(options.baseDelayMs) ? options.baseDelayMs as number : retryOptions.baseDelayMs;
  retryOptions = {
    retries: Math.min(Math.max(retries, 0), 5),
    baseDelayMs: Math.min(Math.max(baseDelayMs, 0), 5000),
  };
}

export function isNetworkError(err: unknown) {
  return err instanceof TypeError || (typeof DOMException !== "undefined" && err instanceof DOMException);
}

function isRetryableError(err: unknown) {
  return isNetworkError(err) || err instanceof TransientRequestError;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout<T>(url: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      if (response.status === 408 || response.status === 429 || response.status >= 500) {
        throw new TransientRequestError(response.status);
      }
      throw new Error(`Request failed with ${response.status}`);
    }
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithRetry<T>(url: string): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retryOptions.retries; attempt += 1) {
    try {
      return await fetchWithTimeout<T>(url);
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err) || attempt === retryOptions.retries) break;
      await wait(retryOptions.baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError;
}

export function getHighlights(limit = 12): Promise<DiscoveryPhoto[]> {
  return fetchWithRetry<DiscoveryPhoto[]>(`${API_BASE}/api/photos/highlights?limit=${limit}`);
}

export function getSimilarPhotos(photoId: string, limit = 8): Promise<DiscoveryPhoto[]> {
  return fetchWithRetry<DiscoveryPhoto[]>(`${API_BASE}/api/photos/${photoId}/similar?limit=${limit}`);
}

export function searchPhotos(query: string, limit = 24): Promise<DiscoveryPhoto[]> {
  return fetchWithRetry<DiscoveryPhoto[]>(
    `${API_BASE}/api/photos/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
}
