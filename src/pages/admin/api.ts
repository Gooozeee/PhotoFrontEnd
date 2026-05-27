import { getAccessToken, signOutAdmin } from "../../lib/supabase";
import { storeAdminRedirectMessage } from "../../lib/adminRedirectMessage";
import { resolveApiBaseUrl } from "../../lib/apiBaseUrl";
import type { AdminAlbum, AdminPhoto } from "./types";

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

  return response.json() as Promise<T>;
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

export async function loadMetadataQueue(): Promise<Array<{ state: string; attempts: number }>> {
  return adminFetch<Array<{ state: string; attempts: number }>>("/api/admin/metadata/queue");
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
