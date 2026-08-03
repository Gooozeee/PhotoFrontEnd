import type { AlbumTreeNode } from "../../utils/buildAlbumTree";
import type { AdminPhoto, UpdatePhotoPayload } from "./types";

export type DragPayload =
  | { kind: "photos"; ids: string[] }
  | { kind: "folder"; albumId: string; path: string[] };

let currentDrag: DragPayload | null = null;

export function setDragPayload(payload: DragPayload | null): void {
  currentDrag = payload;
}

export function getDragPayload(): DragPayload | null {
  return currentDrag;
}

export function isFileDrag(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

export function buildPhotoPayload(photo: AdminPhoto, albumId: string | null = photo.albumId): UpdatePhotoPayload {
  return {
    fileName: photo.fileName,
    description: photo.description,
    fileSizeBytes: photo.fileSizeBytes,
    contentType: photo.contentType,
    width: photo.width,
    height: photo.height,
    takenAt: photo.takenAt,
    albumId,
    location: photo.location,
    cameraModel: photo.cameraModel,
    tags: photo.tags,
  };
}

export function computeReparentNames(source: AlbumTreeNode, targetPrefix: string[]): Array<{ albumId: string; name: string }> {
  const result: Array<{ albumId: string; name: string }> = [];
  const sourceLength = source.path.length;

  const walk = (node: AlbumTreeNode) => {
    if (node.album) {
      const suffix = node.path.slice(sourceLength - 1);
      result.push({ albumId: node.album.id, name: [...targetPrefix, ...suffix].join("/") });
    }
    node.children.forEach(walk);
  };

  walk(source);
  return result;
}
