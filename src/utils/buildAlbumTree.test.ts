import { describe, expect, it } from 'vitest';
import {
  buildAlbumTree,
  findNodeByPath,
  flattenTree,
  getDescendantAlbumIds,
  nodePathLabel,
  splitAlbumName,
} from './buildAlbumTree';
import type { AdminAlbum } from '../pages/admin/types';

function album(id: string, name: string, photosCount = 0): AdminAlbum {
  return {
    id,
    name,
    description: null,
    coverPhotoId: null,
    coverPhotoUrl: null,
    coverThumbnailUrl: null,
    isPublished: false,
    photosCount,
  };
}

describe('splitAlbumName', () => {
  it('splits names on forward slashes and trims', () => {
    expect(splitAlbumName('  Travel / Thailand ')).toEqual(['Travel', 'Thailand']);
  });

  it('drops empty segments', () => {
    expect(splitAlbumName('Travel//Thailand/')).toEqual(['Travel', 'Thailand']);
  });

  it('returns an empty array for blank names', () => {
    expect(splitAlbumName('   ')).toEqual([]);
  });
});

describe('buildAlbumTree', () => {
  it('builds nested folders from album names', () => {
    const tree = buildAlbumTree([album('a1', 'Travel/Thailand'), album('a2', 'Travel/Iceland')]);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.name).toBe('Travel');
    expect(tree[0]?.album).toBeNull();
    expect(tree[0]?.children).toHaveLength(2);
    expect(tree[0]?.children.map((child) => child.name)).toEqual(['Iceland', 'Thailand']);
    expect(tree[0]?.children[0]?.path).toEqual(['Travel', 'Iceland']);
  });

  it('attaches an album to a node when the full name matches the path', () => {
    const travel = album('t1', 'Travel');
    const tree = buildAlbumTree([travel, album('t2', 'Travel/Thailand')]);

    expect(tree[0]?.album).toEqual(travel);
    expect(tree[0]?.children[0]?.album?.id).toBe('t2');
  });

  it('sorts siblings alphabetically', () => {
    const tree = buildAlbumTree([album('a', 'Zebra'), album('b', 'Apple'), album('c', 'Mango')]);

    expect(tree.map((node) => node.name)).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('returns an empty tree for no albums', () => {
    expect(buildAlbumTree([])).toEqual([]);
  });

  it('ignores albums with blank names', () => {
    const tree = buildAlbumTree([album('a', '   '), album('b', 'Real')]);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.name).toBe('Real');
  });

  it('keeps the first album attached when two share a path', () => {
    const tree = buildAlbumTree([album('first', 'Same'), album('second', 'Same')]);
    expect(tree[0]?.album?.id).toBe('first');
  });
});

describe('findNodeByPath', () => {
  it('finds a node by its path segments', () => {
    const tree = buildAlbumTree([album('a', 'Travel/Thailand')]);
    const node = findNodeByPath(tree, ['Travel', 'Thailand']);
    expect(node?.album?.id).toBe('a');
  });

  it('returns null for a missing path', () => {
    const tree = buildAlbumTree([album('a', 'Travel')]);
    expect(findNodeByPath(tree, ['Travel', 'Missing'])).toBeNull();
    expect(findNodeByPath(tree, [])).toBeNull();
  });
});

describe('getDescendantAlbumIds', () => {
  it('collects ids of all nested albums below a node', () => {
    const tree = buildAlbumTree([
      album('a1', 'Travel'),
      album('a2', 'Travel/Thailand'),
      album('a3', 'Travel/Thailand/Bangkok'),
      album('a4', 'Other'),
    ]);

    const travel = findNodeByPath(tree, ['Travel']);
    const ids = getDescendantAlbumIds(travel!);
    expect(ids.sort()).toEqual(['a1', 'a2', 'a3']);
  });
});

describe('flattenTree', () => {
  it('flattens all nodes depth-first', () => {
    const tree = buildAlbumTree([album('a', 'Travel/Thailand'), album('b', 'Home')]);
    const nodes = flattenTree(tree);

    expect(nodes.map((node) => node.path)).toEqual([
      ['Home'],
      ['Travel'],
      ['Travel', 'Thailand'],
    ]);
  });
});

describe('nodePathLabel', () => {
  it('labels the root and nested paths', () => {
    expect(nodePathLabel([])).toBe('All albums');
    expect(nodePathLabel(['Travel', 'Thailand'])).toBe('Travel / Thailand');
  });
});
