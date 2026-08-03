import { getAccessToken, signOutAdmin } from "../../lib/supabase";
import { storeAdminRedirectMessage } from "../../lib/adminRedirectMessage";
import { resolveApiBaseUrl } from "../../lib/apiBaseUrl";
import type { AdminAlbum, AdminPhoto, CreateAlbumPayload, MetadataQueueItem, UpdateAlbumPayload, UpdatePhotoPayload } from "./types";

const API_BASE = resolveApiBaseUrl();

type AdminFetchOptions = {
  redirectOnAuthFailure?: boolean;
};

function redirectToHomeWithMessage(message: string) {
  storeAdminRedirectMessage(message);
  window.location.href = "/";
}

export async function adminFetch<T>(path: string, init?: RequestInit, options: AdminFetchOptions = {}): Promise<T> {
  const { redirectOnAuthFailure = true } = options;
  const token = getAccessToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const error = new Error("Admin session missing or expired. Sign in again.");
      await signOutAdmin().catch(() => undefined);
      if (redirectOnAuthFailure) {
        redirectToHomeWithMessage(getAdminRedirectMessage(error));
      }
      throw error;
    }

    if (response.status === 403) {
      const error = new Error("Admin access denied for this account.");
      await signOutAdmin().catch(() => undefined);
      if (redirectOnAuthFailure) {
        redirectToHomeWithMessage(getAdminRedirectMessage(error));
      }
      throw error;
    }

    throw new Error(`Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as Promise<T>;
}

export async function loadAlbums(): Promise<AdminAlbum[]> {
  return adminFetch<AdminAlbum[]>("/api/albums");
}

export async function loadPublishedAlbums(): Promise<AdminAlbum[]> {
  return adminFetch<AdminAlbum[]>("/api/albums/published");
}

export async function loadPhotos(): Promise<AdminPhoto[]> {
  return adminFetch<AdminPhoto[]>("/api/admin/photos");
}

export async function loadMetadataQueue(): Promise<MetadataQueueItem[]> {
  return adminFetch<MetadataQueueItem[]>("/api/admin/metadata/queue");
}

export async function createAlbum(payload: CreateAlbumPayload): Promise<AdminAlbum> {
  return adminFetch<AdminAlbum>("/api/albums", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateAlbum(id: string, payload: UpdateAlbumPayload): Promise<AdminAlbum> {
  return adminFetch<AdminAlbum>(`/api/albums/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteAlbum(id: string): Promise<void> {
  await adminFetch<void>(`/api/albums/${id}`, { method: "DELETE" });
}

export async function updatePhoto(id: string, payload: UpdatePhotoPayload): Promise<AdminPhoto> {
  return adminFetch<AdminPhoto>(`/api/photos/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deletePhoto(id: string): Promise<void> {
  await adminFetch<void>(`/api/photos/${id}`, { method: "DELETE" });
}

export async function uploadPhoto(formData: FormData): Promise<AdminPhoto> {
  return adminFetch<AdminPhoto>("/api/photos/upload", { method: "POST", body: formData });
}

export async function enqueueMetadata(): Promise<void> {
  await adminFetch<void>("/api/admin/metadata/enqueue", { method: "POST" });
}

export async function resetMetadataQueue(): Promise<{ reset: number }> {
  return adminFetch<{ reset: number }>("/api/admin/metadata/reset", { method: "POST" });
}

export async function verifyAdminSession(): Promise<void> {
  await adminFetch<void>("/api/admin/session", undefined, { redirectOnAuthFailure: false });
}

export function getAdminRedirectMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message === "Admin access denied for this account.") {
    return "This GitHub account is not allowed to access the admin area. You have been signed out.";
  }

  if (message === "Admin session missing or expired. Sign in again.") {
    return "Your admin session expired. You have been signed out.";
  }

  return "Admin access could not be verified. You have been signed out.";
}
