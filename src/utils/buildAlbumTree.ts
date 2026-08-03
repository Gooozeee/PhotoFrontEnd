import type { AdminAlbum } from "../pages/admin/types";

export interface AlbumTreeNode {
  name: string;
  path: string[];
  album: AdminAlbum | null;
  children: AlbumTreeNode[];
}

export function splitAlbumName(name: string): string[] {
  return name
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

function createNode(name: string, path: string[]): AlbumTreeNode {
  return { name, path, album: null, children: [] };
}

export function buildAlbumTree(albums: AdminAlbum[]): AlbumTreeNode[] {
  const root = createNode("", []);

  for (const album of albums) {
    const segments = splitAlbumName(album.name);
    if (segments.length === 0) continue;

    let current = root;
    const path: string[] = [];
    segments.forEach((segment, index) => {
      path.push(segment);
      let child = current.children.find((node) => node.name === segment);
      if (!child) {
        child = createNode(segment, [...path]);
        current.children.push(child);
      }
      if (index === segments.length - 1 && child.album === null) {
        child.album = album;
      }
      current = child;
    });
  }

  sortNodes(root.children);
  return root.children;
}

function sortNodes(nodes: AlbumTreeNode[]): void {
  nodes.sort((a, b) => a.name.localeCompare(b.name));
  nodes.forEach((node) => sortNodes(node.children));
}

export function findNodeByPath(nodes: AlbumTreeNode[], path: string[]): AlbumTreeNode | null {
  let current: AlbumTreeNode | null = null;
  let level = nodes;

  for (const segment of path) {
    current = level.find((node) => node.name === segment) ?? null;
    if (!current) return null;
    level = current.children;
  }

  return current;
}

export function findAlbumById(nodes: AlbumTreeNode[], albumId: string): AlbumTreeNode | null {
  for (const node of nodes) {
    if (node.album?.id === albumId) return node;
    const found = findAlbumById(node.children, albumId);
    if (found) return found;
  }
  return null;
}

export function getDescendantAlbumIds(node: AlbumTreeNode): string[] {
  const ids: string[] = [];
  const walk = (current: AlbumTreeNode) => {
    if (current.album) ids.push(current.album.id);
    current.children.forEach(walk);
  };
  walk(node);
  return ids;
}

export function flattenTree(nodes: AlbumTreeNode[]): AlbumTreeNode[] {
  const flattened: AlbumTreeNode[] = [];
  const walk = (node: AlbumTreeNode) => {
    flattened.push(node);
    node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return flattened;
}

export function nodePathLabel(path: string[]): string {
  if (path.length === 0) return "All albums";
  return path.join(" / ");
}
