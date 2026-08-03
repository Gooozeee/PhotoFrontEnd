import type { GalleryAlbum, GalleryPhoto } from "./useImageGallery";

const birds = import.meta.glob("../assets/Birds/*.{webp,jpg,png}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const cities = import.meta.glob("../assets/Cities/*.{webp,jpg,png}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const landscapes = import.meta.glob("../assets/Landscapes/*.{webp,jpg,png}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const rally = import.meta.glob("../assets/Rally/*.{webp,jpg,png}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

function fileNameFromPath(filePath: string): string {
  const segments = filePath.replace(/\\/g, "/").split("/");
  const last = segments[segments.length - 1] ?? "";
  return last.replace(/\.[^.]+$/, "");
}

function tryExtractYear(name: string): number | null {
  const match = name.match(/\b(\d{4})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function buildAlbum(
  albumId: string,
  albumName: string,
  description: string,
  images: Record<string, string>,
): { album: GalleryAlbum; photos: GalleryPhoto[] } {
  const entries = Object.entries(images).sort(([a], [b]) => a.localeCompare(b));

  const photos: GalleryPhoto[] = entries.map(([filePath, url], index) => {
    const rawName = fileNameFromPath(filePath);
    const year = tryExtractYear(rawName);
    const cleanName = rawName.replace(/\s*\d{4}\s*$/, "").trim();
    const taken = year ? `${year}-01-01T00:00:00.000Z` : new Date().toISOString();

    return {
      id: `${albumId}-photo-${index}`,
      fileName: rawName,
      albumId,
      albumName,
      url,
      thumbnailUrl: null,
      contentType: "image/webp",
      width: 1200,
      height: 800,
      fileSizeBytes: 0,
      description: cleanName,
      caption: null,
      takenAt: taken,
      importedAt: taken,
      location: cleanName,
      cameraModel: null,
      tags: [],
    };
  });

  const cover = photos[0];
  const album: GalleryAlbum = {
    id: albumId,
    name: albumName,
    description,
    coverPhotoId: cover?.id ?? null,
    coverUrl: cover?.url ?? null,
    coverThumbnailUrl: null,
    isPublished: true,
    photosCount: photos.length,
  };

  return { album, photos };
}

const albumsData = [
  buildAlbum("birds", "Birds", "Bird and wildlife photography", birds),
  buildAlbum("cities", "Cities", "City and architecture photography", cities),
  buildAlbum("landscapes", "Landscapes", "Landscape photography from around the world", landscapes),
  buildAlbum("rally", "Rally", "Rally car racing photography", rally),
];

function photosByAlbumMap(): Record<string, GalleryPhoto[]> {
  const map: Record<string, GalleryPhoto[]> = {};
  for (const data of albumsData) {
    map[data.album.id] = data.photos;
  }
  return map;
}

let cached: {
  albums: GalleryAlbum[];
  photosByAlbum: Record<string, GalleryPhoto[]>;
} | null = null;

export function getStaticGalleryData(): {
  albums: GalleryAlbum[];
  photosByAlbum: Record<string, GalleryPhoto[]>;
} {
  if (!cached) {
    cached = {
      albums: albumsData.map((d) => d.album),
      photosByAlbum: photosByAlbumMap(),
    };
  }
  return cached;
}
