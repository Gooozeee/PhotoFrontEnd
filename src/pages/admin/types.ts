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

export type MetadataQueueItem = {
  photoId: string;
  fileName: string;
  albumName: string | null;
  state: "Pending" | "Processing" | "Completed" | "Failed";
  attempts: number;
  lastAttemptAt: string | null;
  completedAt: string | null;
  lastError: string | null;
};
export type AdminPhoto = {
  id: string;
  fileName: string;
  albumId: string | null;
  albumName: string | null;
  url: string;
  thumbnailUrl: string | null;
  description: string | null;
  caption: string | null;
  rating: number | null;
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

export type CreateAlbumPayload = {
  name: string;
  description: string | null;
  isPublished?: boolean;
};

export type UpdateAlbumPayload = {
  name: string;
  description: string | null;
  isPublished: boolean;
  coverPhotoId?: string | null;
};

export type UpdatePhotoPayload = {
  fileName: string;
  description: string | null;
  fileSizeBytes: number;
  contentType: string;
  width: number;
  height: number;
  takenAt: string;
  albumId: string | null;
  location: string | null;
  cameraModel: string | null;
  tags: string[];
};
