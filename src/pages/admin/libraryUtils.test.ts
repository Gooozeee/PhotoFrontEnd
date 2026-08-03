import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildAlbumTree, findAlbumById, type AlbumTreeNode } from '../../utils/buildAlbumTree';
import { buildPhotoPayload, computeReparentNames, getDragPayload, isFileDrag, setDragPayload } from './libraryUtils';
import type { AdminAlbum, AdminPhoto } from './types';

const album = (id: string, name: string): AdminAlbum => ({
  id,
  name,
  description: null,
  coverPhotoId: null,
  coverPhotoUrl: null,
  coverThumbnailUrl: null,
  isPublished: true,
  photosCount: 0,
});

const photo: AdminPhoto = {
  id: 'p1',
  fileName: 'beach.jpg',
  albumId: 'a1',
  albumName: 'Travel',
  url: '/photos/beach.jpg',
  thumbnailUrl: null,
  description: 'Shore',
  caption: 'Sunset',
  rating: 9,
  contentType: 'image/webp',
  width: 1000,
  height: 800,
  fileSizeBytes: 200,
  takenAt: '2024-01-01T00:00:00Z',
  importedAt: '2024-01-01T00:00:00Z',
  location: null,
  cameraModel: null,
  tags: [],
};

describe('libraryUtils drag payload', () => {
  beforeEach(() => setDragPayload(null));
  afterEach(() => setDragPayload(null));

  it('stores and retrieves the active drag payload', () => {
    expect(getDragPayload()).toBeNull();
    setDragPayload({ kind: 'photos', ids: ['p1'] });
    expect(getDragPayload()).toEqual({ kind: 'photos', ids: ['p1'] });
  });

  it('clears the payload with null', () => {
    setDragPayload({ kind: 'folder', albumId: 'a1', path: ['Travel'] });
    setDragPayload(null);
    expect(getDragPayload()).toBeNull();
  });

  it('detects file drags from dataTransfer types', () => {
    const event = { dataTransfer: { types: ['Files'] } } as unknown as React.DragEvent;
    expect(isFileDrag(event)).toBe(true);

    const other = { dataTransfer: { types: ['text/plain'] } } as unknown as React.DragEvent;
    expect(isFileDrag(other)).toBe(false);
  });

  it('builds a photo payload preserving metadata with a new album', () => {
    const payload = buildPhotoPayload(photo, 'a2');
    expect(payload).toEqual({
      fileName: 'beach.jpg',
      description: 'Shore',
      fileSizeBytes: 200,
      contentType: 'image/webp',
      width: 1000,
      height: 800,
      takenAt: '2024-01-01T00:00:00Z',
      albumId: 'a2',
      location: null,
      cameraModel: null,
      tags: [],
    });
  });

  it('keeps the current album by default', () => {
    expect(buildPhotoPayload(photo).albumId).toBe('a1');
  });
});

describe('computeReparentNames', () => {
  function tree(): AlbumTreeNode[] {
    return buildAlbumTree([
      album('a1', 'Travel'),
      album('a2', 'Travel/Thailand'),
      album('a3', 'Travel/Thailand/Bangkok'),
      album('a4', 'Cities'),
    ]);
  }

  it('renames a folder subtree under a new prefix', () => {
    const source = buildAlbumTree([album('a1', 'Travel'), album('a2', 'Travel/Thailand'), album('a3', 'Travel/Thailand/Bangkok')])[0];
    const renames = computeReparentNames(source, ['Europe']);

    expect(renames).toEqual([
      { albumId: 'a1', name: 'Europe/Travel' },
      { albumId: 'a2', name: 'Europe/Travel/Thailand' },
      { albumId: 'a3', name: 'Europe/Travel/Thailand/Bangkok' },
    ]);
  });

  it('moves to the root when the prefix is empty', () => {
    const tree = buildAlbumTree([album('a2', 'Travel/Thailand'), album('a3', 'Travel/Thailand/Bangkok')]);
    const source = findAlbumById(tree, 'a2')!;
    const renames = computeReparentNames(source, []);

    expect(renames).toEqual([
      { albumId: 'a2', name: 'Thailand' },
      { albumId: 'a3', name: 'Thailand/Bangkok' },
    ]);
  });

  it('returns no entries for a folder with no albums', () => {
    const source: AlbumTreeNode = { name: 'Empty', path: ['Empty'], album: null, children: [] };
    expect(computeReparentNames(source, ['X'])).toEqual([]);
  });

  it('handles nested children beyond the direct subtree', () => {
    const tree = buildAlbumTree([
      album('a2', 'Travel/Thailand'),
      album('a3', 'Travel/Thailand/Bangkok'),
      album('a4', 'Travel/Thailand/Bangkok/Grand Palace'),
    ]);
    const source = findAlbumById(tree, 'a2')!;
    const renames = computeReparentNames(source, ['Asia', 'SEA']);

    expect(renames.map((item) => item.name)).toEqual([
      'Asia/SEA/Thailand',
      'Asia/SEA/Thailand/Bangkok',
      'Asia/SEA/Thailand/Bangkok/Grand Palace',
    ]);
  });
});
