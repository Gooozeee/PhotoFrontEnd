import { FormEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "./AdminShell";
import { adminFetch, loadAlbums, loadPhotos } from "./api";
import type { AdminAlbum, AdminPhoto } from "./types";

const bulkMoveUnsetValue = "__unset__";
const bulkMoveClearValue = "__clear__";
const bulkMoveCreateValue = "__create__";
const allPhotosAlbumId = "__all__";
const noAlbumFilterId = "__no-album__";

function buildPhotoPayload(photo: AdminPhoto, albumId: string | null = photo.albumId) {
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

export default function PhotosPage() {
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState<string>(allPhotosAlbumId);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [lastSelectedPhotoId, setLastSelectedPhotoId] = useState<string | null>(null);
  const [bulkMoveAlbumId, setBulkMoveAlbumId] = useState<string>(bulkMoveUnsetValue);
  const [showCreateAlbumForm, setShowCreateAlbumForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedPhotoIdsRef = useRef<string[]>([]);
  const selectedPhotoIdRef = useRef("");
  const lastSelectedPhotoIdRef = useRef<string | null>(null);

  const selectedPhoto = useMemo(() => photos.find((photo) => photo.id === selectedPhotoId) ?? null, [photos, selectedPhotoId]);
  const activeAlbum = useMemo(() => albums.find((album) => album.id === activeAlbumId) ?? null, [activeAlbumId, albums]);
  const activeFilterLabel = activeAlbumId === allPhotosAlbumId
    ? "All photos"
    : activeAlbumId === noAlbumFilterId
      ? "No album"
      : activeAlbum?.name ?? "All photos";
  const visiblePhotos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return photos.filter((photo) => {
      const matchesAlbum = activeAlbumId === allPhotosAlbumId
        ? true
        : activeAlbumId === noAlbumFilterId
          ? photo.albumId === null
          : photo.albumId === activeAlbumId;

      if (!matchesAlbum) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [photo.fileName, photo.description, photo.albumName, photo.location, photo.cameraModel, photo.tags.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [activeAlbumId, photos, searchTerm]);
  const selectedPhotos = useMemo(() => visiblePhotos.filter((photo) => selectedPhotoIds.includes(photo.id)), [selectedPhotoIds, visiblePhotos]);

  function commitSelection(nextSelectedIds: string[], nextSelectedPhotoId: string, nextLastSelectedPhotoId: string | null) {
    selectedPhotoIdsRef.current = nextSelectedIds;
    selectedPhotoIdRef.current = nextSelectedPhotoId;
    lastSelectedPhotoIdRef.current = nextLastSelectedPhotoId;
    setSelectedPhotoIds(nextSelectedIds);
    setSelectedPhotoId(nextSelectedPhotoId);
    setLastSelectedPhotoId(nextLastSelectedPhotoId);
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    selectedPhotoIdsRef.current = selectedPhotoIds;
    selectedPhotoIdRef.current = selectedPhotoId;
    lastSelectedPhotoIdRef.current = lastSelectedPhotoId;
  }, [lastSelectedPhotoId, selectedPhotoId, selectedPhotoIds]);

  useEffect(() => {
    if (!searchTerm) {
      return;
    }

    commitSelection([], "", null);
  }, [searchTerm]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [albumsData, photosData] = await Promise.all([loadAlbums(), loadPhotos()]);
      setAlbums(albumsData);
      setPhotos(photosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  function clearSelection() {
    commitSelection([], "", null);
  }

  function selectAllVisible() {
    const visibleIds = visiblePhotos.map((photo) => photo.id);
    commitSelection(visibleIds, "", visibleIds.at(-1) ?? null);
  }

  function getPhotoIndex(photoId: string) {
    return visiblePhotos.findIndex((photo) => photo.id === photoId);
  }

  function handlePhotoActivate(photoId: string, event?: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>) {
    const isToggleModifier = Boolean(event && (event.ctrlKey || event.metaKey));
    const isRangeModifier = Boolean(event?.shiftKey);
    const currentSelectedIds = selectedPhotoIdsRef.current;
    const currentSelectedPhotoId = selectedPhotoIdRef.current;
    const currentLastSelectedPhotoId = lastSelectedPhotoIdRef.current;

    if (isRangeModifier && currentLastSelectedPhotoId) {
      const startIndex = getPhotoIndex(currentLastSelectedPhotoId);
      const endIndex = getPhotoIndex(photoId);

      if (startIndex !== -1 && endIndex !== -1) {
        const [rangeStart, rangeEnd] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
        const rangeIds = visiblePhotos.slice(rangeStart, rangeEnd + 1).map((photo) => photo.id);
        const nextSelectedIds = Array.from(new Set([...currentSelectedIds, ...rangeIds]));
        commitSelection(
          nextSelectedIds,
          currentSelectedPhotoId && nextSelectedIds.includes(currentSelectedPhotoId) ? currentSelectedPhotoId : "",
          photoId
        );
        return;
      }
    } else if (isToggleModifier) {
      const isSelected = currentSelectedIds.includes(photoId);
      const nextSelectedIds = isSelected
        ? currentSelectedIds.filter((id) => id !== photoId)
        : [...currentSelectedIds, photoId];

      commitSelection(nextSelectedIds, isSelected && currentSelectedPhotoId === photoId ? "" : currentSelectedPhotoId, photoId);
      return;
    }

    commitSelection([photoId], photoId, photoId);
  }

  function selectAlbum(albumId: string) {
    setActiveAlbumId(albumId);
    clearSelection();
  }

  async function savePhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPhoto) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      fileName: form.get("fileName")?.toString() ?? selectedPhoto.fileName,
      description: form.get("description")?.toString() || null,
      fileSizeBytes: Number(form.get("fileSizeBytes") ?? selectedPhoto.fileSizeBytes),
      contentType: form.get("contentType")?.toString() ?? selectedPhoto.contentType,
      width: Number(form.get("width") ?? selectedPhoto.width),
      height: Number(form.get("height") ?? selectedPhoto.height),
      takenAt: form.get("takenAt")?.toString() ?? selectedPhoto.takenAt,
      albumId: form.get("albumId")?.toString() || null,
      location: form.get("location")?.toString() || null,
      cameraModel: form.get("cameraModel")?.toString() || null,
      tags: (form.get("tags")?.toString() || "").split(",").map((item) => item.trim()).filter(Boolean),
    };

    setSaving(true);
    setError(null);
    try {
      const updated = await adminFetch<AdminPhoto>(`/api/photos/${selectedPhoto.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setPhotos((current) => current.map((photo) => photo.id === updated.id ? updated : photo));
      setSelectedPhotoId(updated.id);
      setMessage("Photo saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function movePhoto(photo: AdminPhoto, albumId: string | null) {
    const previousAlbumId = photo.albumId;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminFetch<AdminPhoto>(`/api/photos/${photo.id}`, {
        method: "PUT",
        body: JSON.stringify(buildPhotoPayload(photo, albumId)),
      });
      setPhotos((current) => current.map((item) => item.id === updated.id ? updated : item));
      setAlbums((current) => applyAlbumPhotoMove(current, previousAlbumId, updated.albumId, updated.id));
      setSelectedPhotoId(updated.id);
      setMessage("Photo moved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Move failed");
    } finally {
      setSaving(false);
    }
  }

  async function bulkMove(albumId: string | null) {
    if (selectedPhotos.length === 0) return;
    const photosToMove = [...selectedPhotos];
    const previousAlbums = new Map(photosToMove.map((photo) => [photo.id, photo.albumId]));
    setSaving(true);
    setError(null);
    try {
      const updatedPhotos: AdminPhoto[] = [];
      for (const photo of photosToMove) {
        const updated = await adminFetch<AdminPhoto>(`/api/photos/${photo.id}`, {
          method: "PUT",
          body: JSON.stringify(buildPhotoPayload(photo, albumId)),
        });
        updatedPhotos.push(updated);
      }

      setPhotos((current) => current.map((photo) => updatedPhotos.find((item) => item.id === photo.id) ?? photo));
      setAlbums((current) => {
        const movedPhotosById = new Map(updatedPhotos.map((photo) => [photo.id, photo]));
        return photosToMove.reduce((nextAlbums, originalPhoto) => {
          const updated = movedPhotosById.get(originalPhoto.id);
          return updated ? applyAlbumPhotoMove(nextAlbums, previousAlbums.get(originalPhoto.id) ?? null, updated.albumId, updated.id) : nextAlbums;
        }, current);
      });
      setMessage(`Moved ${photosToMove.length} photos`);
      clearSelection();
      setBulkMoveAlbumId(bulkMoveUnsetValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk move failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelectedPhotos() {
    if (selectedPhotos.length === 0) return;
    const photosToDelete = [...selectedPhotos];
    if (!window.confirm(`Delete ${photosToDelete.length} photo${photosToDelete.length === 1 ? "" : "s"}?`)) return;

    setSaving(true);
    setError(null);
    try {
      for (const photo of photosToDelete) {
        await adminFetch(`/api/photos/${photo.id}`, { method: "DELETE" });
      }

      setPhotos((current) => current.filter((photo) => !photosToDelete.some((item) => item.id === photo.id)));
      clearSelection();
      setMessage(`Deleted ${photosToDelete.length} photos`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function createAlbumAndMoveSelection() {
    const name = newAlbumName.trim();
    if (!name) {
      setError("Album name is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await adminFetch<AdminAlbum>("/api/albums", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: newAlbumDescription.trim() || null,
          isPublished: false,
        }),
      });

      setAlbums((current) => [created, ...current]);
      setActiveAlbumId(created.id);
      setShowCreateAlbumForm(false);
      setNewAlbumName("");
      setNewAlbumDescription("");
      clearSelection();

      if (selectedPhotos.length > 0) {
        const previousAlbums = new Map(selectedPhotos.map((photo) => [photo.id, photo.albumId]));
        const updatedPhotos: AdminPhoto[] = [];
        for (const photo of [...selectedPhotos]) {
          const updated = await adminFetch<AdminPhoto>(`/api/photos/${photo.id}`, {
            method: "PUT",
            body: JSON.stringify(buildPhotoPayload(photo, created.id)),
          });
          updatedPhotos.push(updated);
        }

        setPhotos((current) => current.map((photo) => updatedPhotos.find((item) => item.id === photo.id) ?? photo));
        setAlbums((current) => {
          const movedPhotosById = new Map(updatedPhotos.map((photo) => [photo.id, photo]));
          const withCreatedAlbum = [created, ...current.filter((album) => album.id !== created.id)];
          return selectedPhotos.reduce((nextAlbums, originalPhoto) => {
            const updated = movedPhotosById.get(originalPhoto.id);
            return updated ? applyAlbumPhotoMove(nextAlbums, previousAlbums.get(originalPhoto.id) ?? null, updated.albumId, updated.id) : nextAlbums;
          }, withCreatedAlbum);
        });
        setBulkMoveAlbumId(bulkMoveUnsetValue);
        setMessage(`Album created and ${updatedPhotos.length} photo${updatedPhotos.length === 1 ? "" : "s"} moved`);
      } else if (selectedPhoto) {
        const updated = await adminFetch<AdminPhoto>(`/api/photos/${selectedPhoto.id}`, {
          method: "PUT",
          body: JSON.stringify(buildPhotoPayload(selectedPhoto, created.id)),
        });
        setPhotos((current) => current.map((photo) => photo.id === updated.id ? updated : photo));
        setAlbums((current) => applyAlbumPhotoMove([created, ...current.filter((album) => album.id !== created.id)], selectedPhoto.albumId, updated.albumId, updated.id));
        setSelectedPhotoId(updated.id);
        setMessage(`Album created and ${updated.fileName} moved`);
      } else {
        setMessage(`Album created: ${created.name}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Album creation failed");
    } finally {
      setSaving(false);
    }
  }

  function applyAlbumPhotoMove(albumsState: AdminAlbum[], previousAlbumId: string | null, nextAlbumId: string | null, movedPhotoId: string) {
    if (previousAlbumId === nextAlbumId) {
      return albumsState.map((album) => album.id === nextAlbumId && album.coverPhotoId === null ? { ...album, coverPhotoId: movedPhotoId, photosCount: album.photosCount } : album);
    }

    return albumsState.map((album) => {
      if (album.id === previousAlbumId) {
        return {
          ...album,
          photosCount: Math.max(0, album.photosCount - 1),
          coverPhotoId: album.coverPhotoId === movedPhotoId ? null : album.coverPhotoId,
        };
      }

      if (album.id === nextAlbumId) {
        return {
          ...album,
          photosCount: album.photosCount + 1,
          coverPhotoId: album.coverPhotoId ?? movedPhotoId,
        };
      }

      return album;
    });
  }

  return (
    <AdminShell title="Photos" subtitle="Browse by album first, multi-select with Ctrl/Cmd and Shift, and open the editor only when you need it." active="photos" stats={{ albums: albums.length, photos: photos.length, published: albums.filter((a) => a.isPublished).length }}>
      {(message || error) && (
        <div className={`rounded-2xl border p-4 ${error ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
          {error ?? message}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4 xl:sticky xl:top-[140px] xl:self-start">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Albums</h2>
            <button type="button" className="text-sm text-white/50" onClick={refresh} disabled={loading || saving}>Refresh</button>
          </div>
          <button aria-label="Browse all photos" type="button" onClick={() => selectAlbum(allPhotosAlbumId)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeAlbumId === allPhotosAlbumId ? "border-white bg-white text-black" : "border-white/10 bg-black/20 hover:bg-white/5"}`}>
            <div className="font-medium">All photos</div>
            <div className="text-sm opacity-70">{photos.length} total</div>
          </button>
          <button aria-label="Browse photos with no album" type="button" onClick={() => selectAlbum(noAlbumFilterId)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeAlbumId === noAlbumFilterId ? "border-white bg-white text-black" : "border-white/10 bg-black/20 hover:bg-white/5"}`}>
            <div className="font-medium">No album</div>
            <div className="text-sm opacity-70">{photos.filter((photo) => photo.albumId === null).length} total</div>
          </button>
          <div className="space-y-2 max-h-[600px] overflow-auto pr-1">
            {albums.map((album) => (
              <button aria-label={`Open album ${album.name}`} type="button" key={album.id} onClick={() => selectAlbum(album.id)} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeAlbumId === album.id ? "border-white bg-white text-black" : "border-white/10 bg-black/20 hover:bg-white/5"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{album.name}</div>
                    <div className="text-sm opacity-70">{album.photosCount} photo{album.photosCount === 1 ? "" : "s"}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${album.isPublished ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-white/60"}`}>
                    {album.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg">{activeFilterLabel}</h2>
              <p className="text-sm text-white/50">{visiblePhotos.length} visible photo{visiblePhotos.length === 1 ? "" : "s"}. Click to edit, Ctrl/Cmd-click to toggle selection, Shift-click for a range.</p>
            </div>
            <input
              aria-label="Search photos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search filename, tag, location..."
              className="w-full max-w-sm bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/20 p-3">
            <button type="button" className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm" onClick={selectAllVisible}>Select all visible</button>
            <button type="button" className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm" onClick={clearSelection}>Clear selection</button>
            <select aria-label="Bulk move destination" value={bulkMoveAlbumId} onChange={(event) => setBulkMoveAlbumId(event.target.value)} className="px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-sm">
              <option value={bulkMoveUnsetValue}>Move selected to...</option>
              <option value={bulkMoveClearValue}>No album</option>
              <option value={bulkMoveCreateValue}>New album...</option>
              {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
            </select>
            <button
              type="button"
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm disabled:opacity-50"
              disabled={selectedPhotos.length === 0 || bulkMoveAlbumId === bulkMoveUnsetValue || saving}
              onClick={() => {
                if (bulkMoveAlbumId === bulkMoveCreateValue) {
                  setShowCreateAlbumForm(true);
                  return;
                }

                void bulkMove(bulkMoveAlbumId === bulkMoveClearValue ? null : bulkMoveAlbumId);
              }}
            >
              Bulk move
            </button>
            <button type="button" className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-100 text-sm disabled:opacity-50" disabled={selectedPhotos.length === 0 || saving} onClick={deleteSelectedPhotos}>Delete selected</button>
            <div className="ml-auto text-sm text-white/50 self-center">{selectedPhotoIds.length} selected</div>
          </div>

          {showCreateAlbumForm && !selectedPhoto ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Create album</p>
                  <p className="text-sm text-white/55">Create a draft album and move the current photo or current selection into it.</p>
                </div>
                <button type="button" onClick={() => setShowCreateAlbumForm(false)} className="text-sm text-white/50">Close</button>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  aria-label="New move album name"
                  value={newAlbumName}
                  onChange={(event) => setNewAlbumName(event.target.value)}
                  placeholder="Album name"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
                <input
                  aria-label="New move album description"
                  value={newAlbumDescription}
                  onChange={(event) => setNewAlbumDescription(event.target.value)}
                  placeholder="Description"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
                <button type="button" onClick={() => void createAlbumAndMoveSelection()} disabled={saving} className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50">
                  {saving ? "Working..." : "Create"}
                </button>
              </div>
            </div>
          ) : null}

          {visiblePhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-sm text-white/60">
              No photos match the current album or search.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visiblePhotos.map((photo) => (
                <button
                  key={photo.id}
                  aria-label={`Open ${photo.fileName}`}
                  type="button"
                  onClick={(event) => handlePhotoActivate(photo.id, event)}
                  className={`group overflow-hidden rounded-3xl border text-left transition ${selectedPhotoId === photo.id ? "border-white bg-white/10" : "border-white/10 bg-black/20 hover:bg-white/5"} ${selectedPhotoIds.includes(photo.id) ? "ring-2 ring-white/60" : ""}`}
                >
                  <div className="relative aspect-[4/3]">
                    <img src={photo.thumbnailUrl ?? photo.url} alt={photo.fileName} className="h-full w-full object-cover bg-black/30 group-hover:scale-[1.02] transition-transform" loading="lazy" />
                    <div className="absolute top-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80">
                      {selectedPhotoIds.includes(photo.id) ? "Selected" : "Open"}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                      <div className="font-medium text-white truncate">{photo.fileName}</div>
                      <div className="text-white/65 text-sm truncate">{photo.albumName ?? "No album"}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPhoto ? (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm px-4 py-6 md:px-8 md:py-10">
            <div className="mx-auto flex h-full max-w-7xl items-stretch justify-end">
              <aside className="flex h-full w-full max-w-2xl flex-col overflow-auto rounded-3xl border border-white/10 bg-[#09090B] p-5 space-y-4 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl">Edit photo</h2>
                  <button
                    type="button"
                    className="text-sm text-white/50"
                    onClick={() => {
                      setShowCreateAlbumForm(false);
                      setSelectedPhotoId("");
                    }}
                  >
                    Close
                  </button>
                </div>
                <img src={selectedPhoto.url} alt={selectedPhoto.fileName} className="w-full rounded-3xl object-cover bg-black/30 aspect-[16/10]" />
                <form key={selectedPhoto.id} className="space-y-3" onSubmit={savePhoto}>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">File name</span>
                    <input name="fileName" defaultValue={selectedPhoto.fileName} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Description</span>
                    <input name="description" defaultValue={selectedPhoto.description ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Location</span>
                    <input name="location" defaultValue={selectedPhoto.location ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Camera model</span>
                    <input name="cameraModel" defaultValue={selectedPhoto.cameraModel ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Tags</span>
                    <input name="tags" defaultValue={selectedPhoto.tags.join(", ")} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Taken at</span>
                    <input name="takenAt" defaultValue={selectedPhoto.takenAt} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Album</span>
                    <select name="albumId" defaultValue={selectedPhoto.albumId ?? ""} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2">
                      <option value="">No album</option>
                      {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
                    </select>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="block text-sm text-white/70">
                      <span className="mb-1 block">Size bytes</span>
                      <input name="fileSizeBytes" type="number" defaultValue={selectedPhoto.fileSizeBytes} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                    </label>
                    <label className="block text-sm text-white/70">
                      <span className="mb-1 block">Width</span>
                      <input name="width" type="number" defaultValue={selectedPhoto.width} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                    </label>
                    <label className="block text-sm text-white/70">
                      <span className="mb-1 block">Height</span>
                      <input name="height" type="number" defaultValue={selectedPhoto.height} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                    </label>
                  </div>
                  <label className="block text-sm text-white/70">
                    <span className="mb-1 block">Content type</span>
                    <input name="contentType" defaultValue={selectedPhoto.contentType} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                  </label>
                  <button disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50">Save photo</button>
                </form>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm space-y-1">
                  <p className="text-white/70 uppercase tracking-[0.2em] text-xs">Detected metadata</p>
                  <p><span className="text-white/45">Taken:</span> {new Date(selectedPhoto.takenAt).toLocaleString()}</p>
                  <p><span className="text-white/45">Location:</span> {selectedPhoto.location ?? "Not detected"}</p>
                  <p><span className="text-white/45">Camera:</span> {selectedPhoto.cameraModel ?? "Not detected"}</p>
                  <p><span className="text-white/45">Size:</span> {selectedPhoto.width} × {selectedPhoto.height}</p>
                </div>

                {showCreateAlbumForm ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">Create album</p>
                        <p className="text-sm text-white/55">Create a draft album and move the current photo or current selection into it.</p>
                      </div>
                      <button type="button" onClick={() => setShowCreateAlbumForm(false)} className="text-sm text-white/50">Close</button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        aria-label="New move album name"
                        value={newAlbumName}
                        onChange={(event) => setNewAlbumName(event.target.value)}
                        placeholder="Album name"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                      />
                      <input
                        aria-label="New move album description"
                        value={newAlbumDescription}
                        onChange={(event) => setNewAlbumDescription(event.target.value)}
                        placeholder="Description"
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                      />
                      <button type="button" onClick={() => void createAlbumAndMoveSelection()} disabled={saving} className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50">
                        {saving ? "Working..." : "Create"}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {albums.map((album) => (
                    <button type="button" key={album.id} onClick={() => void movePhoto(selectedPhoto, album.id)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm">
                      Move to {album.name}
                    </button>
                  ))}
                  <button type="button" onClick={() => void movePhoto(selectedPhoto, null)} className="px-3 py-2 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition text-sm">Clear album</button>
                  <button type="button" onClick={() => setShowCreateAlbumForm(true)} className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm">New album...</button>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
}
