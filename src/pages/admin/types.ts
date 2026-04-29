export type AdminAlbum = {
  id: string;
  name: string;
  description: string | null;
  coverPhotoId: string | null;
  coverPhotoUrl: string | null;
  coverThumbnailUrl: string | null;
  isPublished: boolean;
  photosCount: number;
};

export type AdminPhoto = {
  id: string;
  fileName: string;
  albumId: string | null;
  albumName: string | null;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  contentType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  takenAt: string;
  importedAt: string;
  location: string | null;
  cameraModel: string | null;
  tags: string[];
  exifStatus?: {
    hasTakenAt: boolean;
    hasLocation: boolean;
    hasCameraModel: boolean;
  } | null;
};
