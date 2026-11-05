import { useEffect, useState } from "react";
import { getStaticGalleryData } from "../../hooks/staticGalleryData";
import type { GalleryAlbum, GalleryPhoto } from "../../hooks/useImageGallery";
import { resolveApiBaseUrl } from "../../lib/apiBaseUrl";
import { fetchWithRetry, isNetworkError } from "../../lib/discoveryApi";

const API_BASE = resolveApiBaseUrl();
const MAX_PHOTOS_PER_ALBUM = 500;

export type ArchiveSeries = {
  id: string;
  title: string;
  place: string;
  year: string;
  cover: string;
  caption: string;
  images: string[];
  photosCount: number;
};

function yearLabel(photos: GalleryPhoto[]) {
  const years = Array.from(new Set(
    photos
      .map((photo) => new Date(photo.takenAt).getFullYear())
      .filter((year) => Number.isFinite(year)),
  )).sort((a, b) => a - b);

  if (years.length === 0) return "";
  if (years.length === 1) return String(years[0]);
  return `${years[0]}—${years[years.length - 1]}`;
}

export function buildSeries(albums: GalleryAlbum[], photosByAlbum: Record<string, GalleryPhoto[]>) {
  return albums
    .map((album): ArchiveSeries => {
      const photos = photosByAlbum[album.id] ?? [];
      const images = photos.map((photo) => photo.url);

      return {
        id: album.id,
        title: album.name,
        place: album.description ?? "",
        year: yearLabel(photos),
        cover: album.coverThumbnailUrl ?? album.coverUrl ?? images[0] ?? "",
        caption: album.description ?? "",
        images,
        photosCount: album.photosCount,
      };
    })
    .filter((series) => Boolean(series.cover) && (series.images.length > 0 || series.photosCount > 0))
    .sort((a, b) => b.images.length - a.images.length);
}

export function getStaticSeries() {
  const { albums, photosByAlbum } = getStaticGalleryData();
  return buildSeries(albums, photosByAlbum);
}

async function loadAlbumPhotos(albumId: string) {
  const photos = await fetchWithRetry<GalleryPhoto[]>(`${API_BASE}/api/albums/${albumId}/photos`);
  return photos.slice(0, MAX_PHOTOS_PER_ALBUM);
}

export async function fetchSeriesImages(albumId: string) {
  const photos = await loadAlbumPhotos(albumId);
  return photos.map((photo) => photo.url);
}

export async function fetchArchiveSeries() {
  const albums = await fetchWithRetry<GalleryAlbum[]>(`${API_BASE}/api/albums/published`);
  return buildSeries(albums, {});
}

export function useArchiveSeries() {
  const [series, setSeries] = useState<ArchiveSeries[]>(() => getStaticSeries());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const liveSeries = await fetchArchiveSeries();
        if (!cancelled && liveSeries.length > 0) {
          setSeries(liveSeries);
        }
      } catch (err) {
        console.warn("archive: live series failed", err);
        if (!cancelled) {
          setError(isNetworkError(err) ? "Backend unavailable — showing the local archive." : "Could not load the live archive.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { series, loading, error };
}
