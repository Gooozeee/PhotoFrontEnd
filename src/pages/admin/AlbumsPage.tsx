import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminShell } from "./AdminShell";
import { adminFetch, loadAlbums, loadPhotos, loadMetadataQueue } from "./api";
import type { AdminAlbum, AdminPhoto } from "./types";

function renderAlbumCover(album: AdminAlbum, className: string) {
  if (!album.coverThumbnailUrl && !album.coverPhotoUrl) {
    return (
      <div className={`${className} flex items-center justify-center bg-black/30 text-sm text-white/40`}>
        No cover yet
      </div>
    );
  }

  return <img src={album.coverThumbnailUrl ?? album.coverPhotoUrl ?? ""} alt={album.name} className={className} loading="lazy" />;
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [queue, setQueue] = useState<Array<{ state: string; attempts: number }>>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [coverPhotoId, setCoverPhotoId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAlbum = useMemo(() => albums.find((album) => album.id === selectedAlbumId) ?? null, [albums, selectedAlbumId]);
  const albumPhotos = useMemo(
    () => selectedAlbum ? photos.filter((photo) => photo.albumId === selectedAlbum.id) : [],
    [photos, selectedAlbum]
  );

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    setCoverPhotoId(selectedAlbum?.coverPhotoId ?? "");
  }, [selectedAlbum?.coverPhotoId, selectedAlbum?.id]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [albumsData, photosData] = await Promise.all([loadAlbums(), loadPhotos()]);
      const queueData = await loadMetadataQueue();
      setAlbums(albumsData);
      setPhotos(photosData);
      setQueue(queueData);
      if (!selectedAlbumId && albumsData.length > 0) {
        setSelectedAlbumId(albumsData[0].id);
        setCoverPhotoId(albumsData[0].coverPhotoId ?? "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load albums");
    } finally {
      setLoading(false);
    }
  }

  function selectAlbum(album: AdminAlbum) {
    setSelectedAlbumId(album.id);
    setCoverPhotoId(album.coverPhotoId ?? "");
  }

  async function saveCoverPhoto(nextCoverPhotoId: string | null) {
    if (!selectedAlbum) return;

    const previousCoverPhotoId = coverPhotoId;
    setCoverPhotoId(nextCoverPhotoId ?? "");
    setSaving(true);
    setError(null);

    try {
      const updated = await adminFetch<AdminAlbum>(`/api/albums/${selectedAlbum.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: selectedAlbum.name,
          description: selectedAlbum.description,
          isPublished: selectedAlbum.isPublished,
          coverPhotoId: nextCoverPhotoId,
        }),
      });

      setAlbums((current) => current.map((album) => album.id === updated.id ? updated : album));
      setCoverPhotoId(updated.coverPhotoId ?? "");
      setMessage(updated.coverPhotoId ? "Album cover updated" : "Album cover cleared");
    } catch (err) {
      setCoverPhotoId(previousCoverPhotoId);
      setError(err instanceof Error ? err.message : "Cover update failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAlbum) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name")?.toString() ?? selectedAlbum.name,
      description: form.get("description")?.toString() || null,
      isPublished: form.get("isPublished") === "on",
      coverPhotoId: coverPhotoId || null,
    };

    setSaving(true);
    setError(null);
    try {
      const updated = await adminFetch<AdminAlbum>(`/api/albums/${selectedAlbum.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setAlbums((current) => current.map((album) => album.id === updated.id ? updated : album));
      setCoverPhotoId(updated.coverPhotoId ?? "");
      setMessage("Album saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function createAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get("name")?.toString();
    if (!name) return;

    setSaving(true);
    setError(null);
    try {
      const created = await adminFetch<AdminAlbum>("/api/albums", {
        method: "POST",
        body: JSON.stringify({
          name,
          description: form.get("description")?.toString() || null,
          isPublished: false,
        }),
      });
      setAlbums((current) => [created, ...current]);
      setSelectedAlbumId(created.id);
      setMessage("Album created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell title="Albums" subtitle="Pick an album, set its cover, and explicitly publish it when it is ready." active="albums" stats={{ albums: albums.length, photos: photos.length, published: albums.filter((a) => a.isPublished).length }}>
      {(message || error) && (
        <div className={`rounded-2xl border p-4 ${error ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
          {error ?? message}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">AI metadata queue</p>
            <h2 className="text-lg mt-2">Processing status</h2>
          </div>
          <p className="text-sm text-white/60">Visible queue state helps you know when an album is ready to publish.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Pending", value: queue.filter((item) => item.state === "Pending").length },
            { label: "Processing", value: queue.filter((item) => item.state === "Processing").length },
            { label: "Completed", value: queue.filter((item) => item.state === "Completed").length },
            { label: "Failed", value: queue.filter((item) => item.state === "Failed").length },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">All albums</h2>
            <button className="text-sm text-white/50" onClick={refresh} disabled={loading || saving}>Refresh</button>
          </div>
          <div className="grid gap-3 max-h-[660px] overflow-auto pr-1">
            {albums.map((album) => (
              <button key={album.id} onClick={() => selectAlbum(album)} className={`group text-left rounded-3xl overflow-hidden border transition ${selectedAlbumId === album.id ? "border-white bg-white/10" : "border-white/10 bg-black/20 hover:bg-white/5"}`}>
                <div className="relative aspect-[16/10]">
                  {renderAlbumCover(album, "h-full w-full object-cover group-hover:scale-[1.02] transition-transform bg-black/30")}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-center justify-between gap-3 text-white">
                      <div>
                        <div className="font-medium text-lg">{album.name}</div>
                        <div className="text-white/70 text-sm line-clamp-1">{album.description ?? "No description"}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${album.isPublished ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-white/60"}`}>
                          {album.isPublished ? "Published" : "Draft"}
                        </span>
                        <span className="text-sm tabular-nums bg-black/30 rounded-full px-2 py-1">{album.photosCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <form className="mt-4 space-y-3" onSubmit={createAlbum}>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">New album name</span>
              <input name="name" className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <label className="block text-sm text-white/70">
              <span className="mb-1 block">Description</span>
              <input name="description" className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
            </label>
            <p className="text-sm text-white/50">New albums start as drafts so you can finish curation before publishing.</p>
            <button className="w-full px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition">Create album</button>
          </form>
        </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4 sticky top-[140px] self-start">
            {selectedAlbum ? (
              <form key={selectedAlbum.id} className="space-y-4" onSubmit={saveAlbum}>
                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-3xl aspect-[16/9] bg-black/30">
                    {renderAlbumCover(selectedAlbum, "h-full w-full object-cover")}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl">Edit album</h2>
                    <label className="block text-sm text-white/70">
                      <span className="mb-1 block">Album name</span>
                      <input name="name" defaultValue={selectedAlbum.name} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                    </label>
                    <label className="block text-sm text-white/70">
                      <span className="mb-1 block">Description</span>
                      <textarea name="description" defaultValue={selectedAlbum.description ?? ""} rows={4} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2" />
                    </label>
                     <label className="block text-sm text-white/70">
                       <span className="mb-1 block">Cover photo</span>
                       <select name="coverPhotoId" value={coverPhotoId} onChange={(event) => void saveCoverPhoto(event.target.value || null)} className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2">
                         <option value="">No cover</option>
                         {albumPhotos.map((photo) => <option key={photo.id} value={photo.id}>{photo.fileName}</option>)}
                       </select>
                     </label>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Publishing</p>
                          <p className="text-sm text-white/55">Only published albums show up on the public site.</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${selectedAlbum.isPublished ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-white/60"}`}>
                          {selectedAlbum.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input name="isPublished" type="checkbox" defaultChecked={selectedAlbum.isPublished} />
                        Publish this album
                      </label>
                    </div>
                    <button disabled={saving} className="px-4 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50">Save album</button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                 <p className="text-white/60 text-sm mb-2">Photos in this album</p>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {albumPhotos.map((photo) => (
                     <div key={photo.id} className="rounded-xl overflow-hidden border border-white/10 bg-black/20 group relative">
                       <img src={photo.thumbnailUrl ?? photo.url} alt={photo.fileName} className="h-28 w-full object-cover" loading="lazy" />
                       <div className="p-2 text-xs text-white/70 truncate">{photo.fileName}</div>
                        <button type="button" onClick={() => void saveCoverPhoto(photo.id)} className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition">Set cover</button>
                      </div>
                    ))}
                   {albumPhotos.length === 0 && <div className="text-white/40 text-sm">No photos yet.</div>}
                 </div>
               </div>
            </form>
          ) : (
            <div className="text-white/50">Pick an album to edit it.</div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
