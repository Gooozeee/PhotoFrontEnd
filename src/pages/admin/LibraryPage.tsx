import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import { createAlbum, deleteAlbum, deletePhoto, loadAlbums, loadPhotos, updateAlbum, updatePhoto, uploadPhoto } from "./api";
import type { AdminAlbum, AdminPhoto, UpdateAlbumPayload } from "./types";
import FolderTree from "../../components/admin/FolderTree";
import ContextMenu, { type ContextMenuItem } from "../../components/admin/ContextMenu";
import SizeSlider, { loadThumbSize, saveThumbSize, thumbSizePixels } from "../../components/admin/SizeSlider";
import AlbumDialog from "../../components/admin/AlbumDialog";
import PhotoEditorModal from "../../components/admin/PhotoEditorModal";
import { buildAlbumTree, findNodeByPath, flattenTree, type AlbumTreeNode } from "../../utils/buildAlbumTree";
import { buildPhotoPayload, computeReparentNames, getDragPayload, isFileDrag, setDragPayload, type DragPayload } from "./libraryUtils";

type ContextMenuState = {
  x: number;
  y: number;
  kind: "photo" | "folder" | "background";
  photoId?: string;
  albumId?: string;
  path?: string[];
  moveMode?: boolean;
} | null;

function pathKey(path: string[]) {
  return path.join("/");
}

export default function LibraryPage() {
  const location = useLocation();
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [thumbSize, setThumbSize] = useState<number>(() => loadThumbSize(50));
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [lastSelectedPhotoId, setLastSelectedPhotoId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [editorPhoto, setEditorPhoto] = useState<AdminPhoto | null>(null);
  const [albumDialog, setAlbumDialog] = useState<{ album: AdminAlbum | null } | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string[] | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedPhotoIdsRef = useRef<string[]>([]);
  const selectedPhotoIdRef = useRef("");
  const lastSelectedPhotoIdRef = useRef<string | null>(null);

  const tree = useMemo(() => buildAlbumTree(albums), [albums]);
  const currentNode = useMemo(() => findNodeByPath(tree, currentPath), [tree, currentPath]);
  const visibleFolders = currentNode?.children ?? tree;
  const currentAlbum = currentNode?.album ?? null;
  const currentPhotos = useMemo(() => {
    if (currentPath.length === 0) return photos.filter((photo) => photo.albumId === null);
    if (!currentAlbum) return [];
    return photos.filter((photo) => photo.albumId === currentAlbum.id);
  }, [currentAlbum, currentPath, photos]);
  const selectedPhotos = useMemo(
    () => photos.filter((photo) => selectedPhotoIds.includes(photo.id)),
    [photos, selectedPhotoIds]
  );
  const reviewTargetIds = useMemo(() => {
    const reviewParam = new URLSearchParams(location.search).get("review");
    return reviewParam ? reviewParam.split(",").map((item) => item.trim()).filter(Boolean) : [];
  }, [location.search]);

  function commitSelection(nextIds: string[], nextPhotoId: string, nextLastId: string | null) {
    selectedPhotoIdsRef.current = nextIds;
    selectedPhotoIdRef.current = nextPhotoId;
    lastSelectedPhotoIdRef.current = nextLastId;
    setSelectedPhotoIds(nextIds);
    setSelectedPhotoId(nextPhotoId);
    setLastSelectedPhotoId(nextLastId);
  }

  function openFolder(path: string[]) {
    setCurrentPath(path);
    setExpanded((prev) => {
      const next = new Set(prev);
      for (let i = 1; i <= path.length; i++) next.add(pathKey(path.slice(0, i)));
      return next;
    });
    commitSelection([], "", null);
    setContextMenu(null);
  }

  function toggleFolder(path: string[]) {
    const key = pathKey(path);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    selectedPhotoIdsRef.current = selectedPhotoIds;
    selectedPhotoIdRef.current = selectedPhotoId;
    lastSelectedPhotoIdRef.current = lastSelectedPhotoId;
  }, [selectedPhotoId, selectedPhotoIds, lastSelectedPhotoId]);

  useEffect(() => {
    if (reviewTargetIds.length === 0 || photos.length === 0) return;
    const firstReviewPhoto = photos.find((photo) => reviewTargetIds.includes(photo.id));
    if (firstReviewPhoto) setEditorPhoto(firstReviewPhoto);
  }, [photos, reviewTargetIds]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [albumsData, photosData] = await Promise.all([loadAlbums(), loadPhotos()]);
      setAlbums(albumsData);
      setPhotos(photosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setLoading(false);
    }
  }

  function getPhotoIndex(photoId: string) {
    return currentPhotos.findIndex((photo) => photo.id === photoId);
  }

  function handlePhotoActivate(photoId: string, event?: MouseEvent<HTMLButtonElement>) {
    const isToggle = Boolean(event && (event.ctrlKey || event.metaKey));
    const isRange = Boolean(event?.shiftKey);
    const currentIds = selectedPhotoIdsRef.current;
    const currentPhotoId = selectedPhotoIdRef.current;
    const currentLastId = lastSelectedPhotoIdRef.current;

    if (isRange && currentLastId) {
      const start = getPhotoIndex(currentLastId);
      const end = getPhotoIndex(photoId);
      if (start !== -1 && end !== -1) {
        const [from, to] = start < end ? [start, end] : [end, start];
        const rangeIds = currentPhotos.slice(from, to + 1).map((photo) => photo.id);
        const next = Array.from(new Set([...currentIds, ...rangeIds]));
        commitSelection(next, currentPhotoId && next.includes(currentPhotoId) ? currentPhotoId : "", photoId);
        return;
      }
    } else if (isToggle) {
      const isSelected = currentIds.includes(photoId);
      const next = isSelected ? currentIds.filter((id) => id !== photoId) : [...currentIds, photoId];
      commitSelection(next, isSelected && currentPhotoId === photoId ? "" : currentPhotoId, photoId);
      return;
    }

    commitSelection([photoId], photoId, photoId);
  }

  function openPhotoContextMenu(photoId: string, x: number, y: number, event?: MouseEvent<HTMLButtonElement>) {
    const isSelected = selectedPhotoIdsRef.current.includes(photoId);
    if (!isSelected) commitSelection([photoId], photoId, photoId);
    setContextMenu({ x, y, kind: "photo", photoId });
  }

  async function savePhoto(payload: Parameters<typeof updatePhoto>[1]) {
    if (!editorPhoto) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePhoto(editorPhoto.id, payload);
      setPhotos((current) => current.map((photo) => (photo.id === updated.id ? updated : photo)));
      setEditorPhoto(updated);
      setMessage("Photo saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function movePhotosToPath(path: string[], ids: string[]) {
    setSaving(true);
    setError(null);
    try {
      let targetAlbum = path.length === 0 ? null : findNodeByPath(tree, path)?.album ?? null;
      if (path.length > 0 && !targetAlbum) {
        const created = await createAlbum({ name: path.join("/"), description: null });
        targetAlbum = created;
        setAlbums((current) => [...current, created]);
      }
      for (const id of ids) {
        const photo = photos.find((item) => item.id === id);
        if (!photo) continue;
        const updated = await updatePhoto(id, buildPhotoPayload(photo, targetAlbum?.id ?? null));
        setPhotos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
      setMessage(`Moved ${ids.length} photo${ids.length === 1 ? "" : "s"}`);
      commitSelection([], "", null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Move failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelectedPhotos() {
    if (selectedPhotos.length === 0) return;
    const toDelete = [...selectedPhotos];
    if (!window.confirm(`Delete ${toDelete.length} photo${toDelete.length === 1 ? "" : "s"}?`)) return;
    setSaving(true);
    setError(null);
    try {
      for (const photo of toDelete) {
        await deletePhoto(photo.id);
      }
      setPhotos((current) => current.filter((photo) => !toDelete.some((item) => item.id === photo.id)));
      commitSelection([], "", null);
      setMessage(`Deleted ${toDelete.length} photos`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveAlbum(values: { name: string; description: string; isPublished: boolean }) {
    if (!albumDialog) return;
    setSaving(true);
    setError(null);
    try {
      if (albumDialog.album) {
        const parentPath = albumDialog.album.name.split("/").slice(0, -1);
        const payload: UpdateAlbumPayload = {
          name: [...parentPath, values.name.trim()].filter(Boolean).join("/"),
          description: values.description,
          isPublished: values.isPublished,
          coverPhotoId: albumDialog.album.coverPhotoId,
        };
        const updated = await updateAlbum(albumDialog.album.id, payload);
        setAlbums((current) => current.map((album) => (album.id === updated.id ? updated : album)));
        setMessage("Album saved");
      } else {
        const name = currentPath.length > 0 ? [...currentPath, values.name].join("/") : values.name;
        const created = await createAlbum({ name, description: values.description, isPublished: values.isPublished });
        setAlbums((current) => [...current, created]);
        setMessage(`Album created: ${values.name}`);
      }
      setAlbumDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Album save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAlbum(album: AdminAlbum) {
    if (!window.confirm(`Delete album "${album.name}"? Photos will be unlinked and kept.`)) return;
    setSaving(true);
    setError(null);
    try {
      for (const photo of photos.filter((item) => item.albumId === album.id)) {
        const updated = await updatePhoto(photo.id, buildPhotoPayload(photo, null));
        setPhotos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      }
      await deleteAlbum(album.id);
      setAlbums((current) => current.filter((item) => item.id !== album.id));
      setAlbumDialog(null);
      setCurrentPath([]);
      commitSelection([], "", null);
      setMessage("Album deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete album failed");
    } finally {
      setSaving(false);
    }
  }

  async function reparentFolder(source: AlbumTreeNode, targetPath: string[]) {
    const renames = computeReparentNames(source, targetPath);
    setSaving(true);
    setError(null);
    try {
      for (const rename of renames) {
        const album = albums.find((item) => item.id === rename.albumId);
        if (!album) continue;
        await updateAlbum(album.id, {
          name: rename.name,
          description: album.description,
          isPublished: album.isPublished,
          coverPhotoId: album.coverPhotoId,
        });
      }
      await refresh();
      setMessage(`Moved ${renames.length} album${renames.length === 1 ? "" : "s"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Move folder failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const fileList = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (fileList.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      let targetAlbum = currentAlbum;
      if (!targetAlbum && currentPath.length > 0) {
        const created = await createAlbum({ name: currentPath.join("/"), description: null });
        targetAlbum = created;
        setAlbums((current) => [...current, created]);
      }
      for (const file of fileList) {
        const form = new FormData();
        form.append("file", file);
        if (targetAlbum) form.append("albumId", targetAlbum.id);
        await uploadPhoto(form);
      }
      await refresh();
      setMessage(`Uploaded ${fileList.length} photo${fileList.length === 1 ? "" : "s"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  function handleFolderDrop(path: string[]) {
    const payload = getDragPayload();
    setDragOverPath(null);
    if (!payload) return;
    if (payload.kind === "photos") {
      void movePhotosToPath(path, payload.ids);
    } else if (payload.kind === "folder") {
      if (pathKey(payload.path) === pathKey(path) || pathKey(path).startsWith(`${pathKey(payload.path)}/`)) {
        setDragPayload(null);
        return;
      }
      const sourceNode = findNodeByPath(tree, payload.path);
      if (sourceNode) void reparentFolder(sourceNode, path);
    }
    setDragPayload(null);
  }

  function handleFileDrop(event: React.DragEvent) {
    event.preventDefault();
    setFileDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      void uploadFiles(event.dataTransfer.files);
    }
  }

  function folderMenuItems(node: AlbumTreeNode): ContextMenuItem[] {
    const items: ContextMenuItem[] = [
      { label: "Open", onClick: () => openFolder(node.path) },
    ];
    if (node.album) {
      items.push(
        { label: "New album inside", onClick: () => setAlbumDialog({ album: null }) },
        { label: node.album.isPublished ? "Unpublish" : "Publish", onClick: () => void togglePublish(node.album!) },
        { label: "Rename", onClick: () => setAlbumDialog({ album: node.album }) },
        { label: "Edit description", onClick: () => setAlbumDialog({ album: node.album }) },
        { label: "Delete", danger: true, onClick: () => void handleDeleteAlbum(node.album!) },
      );
    } else {
      items.push({ label: "New album inside", onClick: () => setAlbumDialog({ album: null }) });
    }
    return items;
  }

  async function togglePublish(album: AdminAlbum) {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAlbum(album.id, {
        name: album.name,
        description: album.description,
        isPublished: !album.isPublished,
        coverPhotoId: album.coverPhotoId,
      });
      setAlbums((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(updated.isPublished ? `Published: ${updated.name}` : `Unpublished: ${updated.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish toggle failed");
    } finally {
      setSaving(false);
    }
  }

  async function setCoverPhoto(photo: AdminPhoto) {
    if (!currentAlbum) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAlbum(currentAlbum.id, {
        name: currentAlbum.name,
        description: currentAlbum.description,
        isPublished: currentAlbum.isPublished,
        coverPhotoId: photo.id,
      });
      setAlbums((current) => current.map((album) => (album.id === updated.id ? updated : album)));
      setMessage("Cover photo set");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Set cover failed");
    } finally {
      setSaving(false);
    }
  }

  function contextItems(state: NonNullable<ContextMenuState>) {
    if (state.kind === "background") {
      return [
        { label: "New album here", onClick: () => setAlbumDialog({ album: null }) },
        { label: "Upload photos here", onClick: () => document.getElementById("file-drop-input")?.click() },
      ];
    }

    if (state.kind === "folder") {
      const node = findNodeByPath(tree, state.path ?? []);
      if (node) return folderMenuItems(node);
      return [];
    }

    const photo = photos.find((item) => item.id === state.photoId);
    if (!photo) return [];

    if (state.moveMode) {
      const folderItems = flattenTree(tree).map((node) => ({
        label: `Move to ${node.path.join(" / ")}`,
        onClick: () => void movePhotosToPath(node.path, [photo.id]),
      }));
      return [
        { label: "← Back", onClick: () => setContextMenu({ ...state, moveMode: false }) },
        { label: "Move to No album", onClick: () => void movePhotosToPath([], [photo.id]) },
        ...folderItems,
      ];
    }

    const items: ContextMenuItem[] = [
      { label: "Open", onClick: () => setEditorPhoto(photo) },
      { label: "Edit metadata", onClick: () => setEditorPhoto(photo) },
      { label: "Move to folder…", onClick: () => setContextMenu({ ...state, moveMode: true }) },
    ];
    if (currentAlbum) {
      items.push({ label: "Set as cover", onClick: () => void setCoverPhoto(photo) });
    }
    items.push({ label: "Delete", danger: true, onClick: () => void deleteSelectedPhotos() });
    return items;
  }

  const pixelSize = thumbSizePixels(thumbSize);

  return (
    <AdminShell title="Library" subtitle="Albums are folders. Drag photos onto a folder to move them, right-click for actions, and drop files anywhere to upload." active="library" stats={{ albums: albums.length, photos: photos.length, published: albums.filter((a) => a.isPublished).length }}>
      {(message || error) && (
        <div className={`rounded-2xl border p-4 ${error ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
          {error ?? message}
        </div>
      )}

      <input
        id="file-drop-input"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files && event.target.files.length > 0) void uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4 lg:sticky lg:top-[140px] lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Folders</h2>
            <button type="button" className="text-sm text-white/50" onClick={refresh} disabled={loading || saving}>Refresh</button>
          </div>
          <FolderTree
            nodes={tree}
            expanded={expanded}
            selectedPath={currentPath}
            onToggle={toggleFolder}
            onSelect={openFolder}
            onFolderContextMenu={(path, x, y) => setContextMenu({ x, y, kind: "folder", path })}
          />
          <div className="border-t border-white/10 pt-4">
            <SizeSlider value={thumbSize} onChange={(value) => { setThumbSize(value); saveThumbSize(value); }} />
          </div>
        </aside>

        <div
          className={`rounded-3xl border ${fileDragOver ? "border-white/60 bg-white/10" : "border-white/10 bg-white/5"} p-5 space-y-4 min-w-0 transition-colors`}
          onDragOver={(event) => {
            if (isFileDrag(event)) {
              event.preventDefault();
              setFileDragOver(true);
            }
          }}
          onDragLeave={() => setFileDragOver(false)}
          onDrop={handleFileDrop}
        >
           <div className="flex flex-wrap items-start justify-between gap-3">
             <div className="min-w-0">
               <label className="mb-2 flex items-center gap-2 text-sm text-white/60 lg:hidden">
                 <span className="shrink-0">Folder</span>
                 <select
                   aria-label="Folder navigation"
                   value={pathKey(currentPath)}
                   onChange={(event) => openFolder(event.target.value ? event.target.value.split("/") : [])}
                   className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white"
                 >
                   <option value="">All albums</option>
                   {flattenTree(tree).map((node) => (
                     <option key={pathKey(node.path)} value={pathKey(node.path)}>
                       {node.path.join(" / ")}
                     </option>
                   ))}
                 </select>
               </label>
               <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
                <button type="button" onClick={() => openFolder([])} className={`rounded-lg px-2 py-1 transition ${currentPath.length === 0 ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>
                  All albums
                </button>
                {currentPath.map((segment, index) => {
                  const target = currentPath.slice(0, index + 1);
                  const isLast = index === currentPath.length - 1;
                  return (
                    <span key={target.join("/")} className="flex items-center gap-1.5">
                      <span className="text-white/30">/</span>
                      <button type="button" onClick={() => openFolder(target)} className={`rounded-lg px-2 py-1 transition ${isLast ? "bg-white text-black" : "text-white/70 hover:text-white"}`}>
                        {segment}
                      </button>
                    </span>
                  );
                })}
              </nav>
              <p className="mt-1 text-sm text-white/50">
                {currentPath.length === 0 ? "Photos without an album live here." : currentAlbum ? `Album "${currentAlbum.name}" — ${currentPhotos.length} photo${currentPhotos.length === 1 ? "" : "s"}.` : "Intermediate folder — create an album here or keep browsing."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SizeSlider value={thumbSize} onChange={(value) => { setThumbSize(value); saveThumbSize(value); }} />
              <button type="button" className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-sm text-white/80 hover:bg-white/5" onClick={() => setAlbumDialog({ album: null })}>New album</button>
              <button type="button" className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 text-sm text-white/80 hover:bg-white/5" onClick={() => document.getElementById("file-drop-input")?.click()}>Upload</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 items-center">
            <button type="button" className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm" onClick={() => commitSelection(currentPhotos.map((photo) => photo.id), "", currentPhotos.at(-1)?.id ?? null)}>Select all</button>
            <button type="button" className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm" onClick={() => commitSelection([], "", null)}>Clear</button>
            <button type="button" className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-100 text-sm disabled:opacity-50" disabled={selectedPhotos.length === 0 || saving} onClick={deleteSelectedPhotos}>Delete selected</button>
            <div className="ml-auto text-sm text-white/50 self-center">{selectedPhotoIds.length} selected</div>
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${pixelSize}px, 1fr))` }}
            onContextMenu={(event) => {
              event.preventDefault();
              setContextMenu({ x: event.clientX, y: event.clientY, kind: "background" });
            }}
          >
            {visibleFolders.map((node) => {
              const isDragOver = dragOverPath && pathKey(dragOverPath) === pathKey(node.path);
              return (
                <div
                  key={pathKey(node.path)}
                  draggable={Boolean(node.album)}
                  onDragStart={() => node.album && setDragPayload({ kind: "folder", albumId: node.album.id, path: node.path })}
                  onDragEnd={() => setDragPayload(null)}
                  onDragOver={(event) => { event.preventDefault(); setDragOverPath(node.path); }}
                  onDragLeave={() => setDragOverPath((current) => (current && pathKey(current) === pathKey(node.path) ? null : current))}
                  onDrop={(event) => { event.preventDefault(); event.stopPropagation(); handleFolderDrop(node.path); }}
                  onDoubleClick={() => openFolder(node.path)}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border text-left transition ${isDragOver ? "border-white/80 bg-white/20" : "border-white/10 bg-black/20 hover:bg-white/5"}`}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setContextMenu({ x: event.clientX, y: event.clientY, kind: "folder", path: node.path });
                  }}
                >
                  <div className="flex h-28 items-center justify-center bg-black/30">
                    {node.album?.coverThumbnailUrl ? (
                      <img src={node.album.coverThumbnailUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-4xl text-white/40">▣</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="truncate font-medium">{node.name}</div>
                    <div className="text-xs text-white/50">
                      {node.album
                        ? `${node.album.photosCount} photo${node.album.photosCount === 1 ? "" : "s"}${node.album.isPublished ? " · Published" : " · Draft"}`
                        : `${node.children.length} folder${node.children.length === 1 ? "" : "s"}`}
                    </div>
                  </div>
                </div>
              );
            })}

            {currentPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                draggable
                onDragStart={() => setDragPayload({ kind: "photos", ids: selectedPhotoIds.includes(photo.id) ? selectedPhotoIds : [photo.id] })}
                onDragEnd={() => setDragPayload(null)}
                onClick={(event) => handlePhotoActivate(photo.id, event)}
                onDoubleClick={() => setEditorPhoto(photo)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openPhotoContextMenu(photo.id, event.clientX, event.clientY);
                }}
                className={`group overflow-hidden rounded-3xl border text-left transition ${selectedPhotoId === photo.id ? "border-white bg-white/10" : "border-white/10 bg-black/20 hover:bg-white/5"} ${selectedPhotoIds.includes(photo.id) ? "ring-2 ring-white/60" : ""}`}
              >
                <div className="relative aspect-square">
                  <img src={photo.thumbnailUrl ?? photo.url} alt={photo.fileName} className="h-full w-full object-cover bg-black/30 group-hover:scale-[1.02] transition-transform" loading="lazy" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2.5">
                    <div className="truncate text-sm font-medium">{photo.fileName}</div>
                  </div>
                  {photo.rating != null ? (
                    <div className="absolute top-2 right-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] text-white/80">{photo.rating}/10</div>
                  ) : null}
                </div>
              </button>
            ))}
          </div>

          {visibleFolders.length === 0 && currentPhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center text-sm text-white/60">
              {currentPath.length === 0
                ? "No albums or photos yet. Create an album, upload photos, or drop files anywhere on this pane."
                : currentAlbum
                  ? "This album is empty. Drop photos here or drag them from another folder."
                  : "Create an album inside this folder to start adding photos."}
            </div>
          ) : null}

          {fileDragOver ? (
            <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/60">
              <div className="rounded-3xl border-2 border-dashed border-white/60 bg-white/10 p-8 text-white">Drop to upload</div>
            </div>
          ) : null}
        </div>
      </section>

      {contextMenu ? (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextItems(contextMenu)} onClose={() => setContextMenu(null)} />
      ) : null}

      {editorPhoto ? (
        <PhotoEditorModal
          photo={editorPhoto}
          albums={albums}
          saving={saving}
          onSave={(payload) => void savePhoto(payload)}
          onClose={() => setEditorPhoto(null)}
        />
      ) : null}

      {albumDialog ? (
        <AlbumDialog
          title={albumDialog.album ? `Rename "${albumDialog.album.name}"` : `New album in "${nodePathLabel(currentPath)}"`}
          album={albumDialog.album}
          saving={saving}
          onSave={(values) => void saveAlbum(values)}
          onDelete={albumDialog.album ? () => void handleDeleteAlbum(albumDialog.album!) : undefined}
          onClose={() => setAlbumDialog(null)}
        />
      ) : null}
    </AdminShell>
  );
}

function nodePathLabel(path: string[]) {
  return path.length === 0 ? "All albums" : path.join(" / ");
}
