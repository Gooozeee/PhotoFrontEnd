import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminShell } from "./AdminShell";
import { adminFetch, loadAlbums, loadPhotos, uploadPhotoWithProgress } from "./api";
import type { AdminAlbum, AdminPhoto } from "./types";

type UploadStatus = "queued" | "uploading" | "uploaded" | "failed";

type QueuedUpload = {
  id: string;
  runId: number;
  file: File;
  previewUrl: string | null;
  albumId: string | null;
  albumName: string | null;
  status: UploadStatus;
  progress: number;
  uploadedPhotoId: string | null;
  exifStatus: AdminPhoto["exifStatus"];
  error: string | null;
};

function createPreviewUrl(file: File) {
  return typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
    ? URL.createObjectURL(file)
    : null;
}

function revokePreviewUrl(previewUrl: string | null) {
  if (!previewUrl || typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") {
    return;
  }

  URL.revokeObjectURL(previewUrl);
}

function getStatusLabel(item: QueuedUpload) {
  switch (item.status) {
    case "queued":
      return "Queued";
    case "uploading":
      return "Uploading";
    case "uploaded":
      return "Uploaded";
    case "failed":
      return "Failed";
  }
}

function getStatusClassName(item: QueuedUpload) {
  switch (item.status) {
    case "queued":
      return "border-white/10 bg-white/5 text-white/70";
    case "uploading":
      return "border-sky-500/30 bg-sky-500/10 text-sky-100";
    case "uploaded":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
    case "failed":
      return "border-red-500/30 bg-red-500/10 text-red-100";
  }
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [showCreateAlbumForm, setShowCreateAlbumForm] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [newAlbumDescription, setNewAlbumDescription] = useState("");
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [queue, setQueue] = useState<QueuedUpload[]>([]);
  const queueRef = useRef<QueuedUpload[]>([]);
  const uploadingRef = useRef(false);
  const currentRunIdRef = useRef(0);
  const uploadRunSummaryRef = useRef({ uploaded: 0, failed: 0 });
  const uploadedBatchPhotoIdsRef = useRef<string[]>([]);
  const reviewNavigationTriggeredRef = useRef(false);
  const lastProgressUpdateRef = useRef(0);

  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? null;
  const queueSummary = useMemo(() => ({
    queued: queue.filter((item) => item.status === "queued").length,
    uploading: queue.filter((item) => item.status === "uploading").length,
    uploaded: queue.filter((item) => item.status === "uploaded").length,
    failed: queue.filter((item) => item.status === "failed").length,
  }), [queue]);
  const currentUpload = queue.find((item) => item.status === "uploading") ?? queue.find((item) => item.status === "queued") ?? null;
  const runSummary = useMemo(() => {
    const runItems = currentRunIdRef.current ? queue.filter((item) => item.runId === currentRunIdRef.current) : [];
    const done = runItems.filter((item) => item.status === "uploaded" || item.status === "failed").length;
    return {
      total: runItems.length,
      done,
      percent: runItems.length === 0 ? 0 : Math.round((done / runItems.length) * 100),
    };
  }, [queue]);
  const activeUpload = queue.find((item) => item.status === "uploading") ?? null;
  const activeProgress = activeUpload?.progress ?? 0;

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    uploadingRef.current = uploading;
  }, [uploading]);

  useEffect(() => {
    if (!uploading) {
      reviewNavigationTriggeredRef.current = false;
    }
  }, [uploading]);

  useEffect(() => {
    return () => {
      for (const item of queueRef.current) {
        revokePreviewUrl(item.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (!uploadingRef.current) {
      return;
    }

    const activeUpload = queue.find((item) => item.status === "uploading");
    if (activeUpload) {
      return;
    }

    const nextQueued = queue.find((item) => item.status === "queued");
    if (nextQueued) {
      void uploadQueuedItem(nextQueued.id);
      return;
    }

    const uploadedBatchPhotoIds = uploadedBatchPhotoIdsRef.current;
    if (!reviewNavigationTriggeredRef.current && uploadedBatchPhotoIds.length > 0) {
      reviewNavigationTriggeredRef.current = true;
      navigate(`/admin/photos?review=${encodeURIComponent(uploadedBatchPhotoIds.join(","))}`);
    }

    uploadingRef.current = false;
    setUploading(false);
    const { uploaded, failed } = uploadRunSummaryRef.current;
    if (failed === 0) {
      setError(null);
    }
    setMessage(`Upload complete. ${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded${failed > 0 ? `, ${failed} failed` : ""}.`);
  }, [queue, queueSummary.failed, queueSummary.uploaded]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [albumsData, photosData] = await Promise.all([loadAlbums(), loadPhotos()]);
      setAlbums(albumsData);
      setPhotos(photosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load upload data");
    } finally {
      setLoading(false);
    }
  }

  function queueFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    const batchId = Date.now();
    const selectedAlbum = albums.find((album) => album.id === selectedAlbumId) ?? null;
    const runId = uploadingRef.current ? currentRunIdRef.current : batchId;
    if (!uploadingRef.current) {
      currentRunIdRef.current = runId;
    }
    const queued = files.map((file, index) => ({
      id: `${batchId}-${index}-${file.name}`,
      runId,
      file,
      previewUrl: createPreviewUrl(file),
      albumId: selectedAlbum?.id ?? null,
      albumName: selectedAlbum?.name ?? null,
      status: "queued" as const,
      progress: 0,
      uploadedPhotoId: null,
      exifStatus: null,
      error: null,
    } satisfies QueuedUpload));

    if (!uploadingRef.current) {
      uploadRunSummaryRef.current = { uploaded: 0, failed: 0 };
      uploadedBatchPhotoIdsRef.current = [];
    }

    setQueue((current) => [...current, ...queued]);
    setError(null);
    setMessage(`Queued ${queued.length} photo${queued.length === 1 ? "" : "s"}. Uploads will start automatically and run one at a time.`);
    uploadingRef.current = true;
    setUploading(true);
  }

  function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    queueFiles(Array.from(files));
    event.target.value = "";
  }

  async function createBatchAlbum() {
    const name = newAlbumName.trim();
    if (!name) {
      setError("Album name is required");
      return;
    }

    setCreatingAlbum(true);
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
      setSelectedAlbumId(created.id);
      setShowCreateAlbumForm(false);
      setNewAlbumName("");
      setNewAlbumDescription("");
      setMessage(`Album created. The next batch will upload into ${created.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Album creation failed");
    } finally {
      setCreatingAlbum(false);
    }
  }

  function removeQueuedItem(id: string) {
    const item = queueRef.current.find((entry) => entry.id === id);
    if (!item || item.status === "uploading") {
      return;
    }

    revokePreviewUrl(item.previewUrl);
    setQueue((current) => current.filter((entry) => entry.id !== id));
    setMessage(`Removed ${item.file.name} from the queue.`);
  }

  function clearQueue() {
    if (uploadingRef.current) {
      return;
    }

    for (const item of queueRef.current) {
      revokePreviewUrl(item.previewUrl);
    }

    setQueue([]);
    setError(null);
    setMessage("Cleared the upload queue.");
  }

  function retryFailedUploads() {
    const hasFailed = queueRef.current.some((item) => item.status === "failed");
    if (!hasFailed) {
      return;
    }

    if (!uploadingRef.current) {
      uploadRunSummaryRef.current = { uploaded: 0, failed: 0 };
      currentRunIdRef.current = Date.now();
    }

    const retryRunId = currentRunIdRef.current;
    setQueue((current) => current.map((item) => item.status === "failed"
      ? { ...item, runId: retryRunId, status: "queued", progress: 0, error: null }
      : item));
    setError(null);
    setMessage("Retrying failed uploads one at a time.");
    uploadingRef.current = true;
    setUploading(true);
  }

  async function uploadQueuedItem(id: string) {
    const item = queueRef.current.find((entry) => entry.id === id);
    if (!item) {
      return;
    }

    setQueue((current) => current.map((entry) => entry.id === id ? { ...entry, status: "uploading", progress: 0, error: null } : entry));

    const reportProgress = (percent: number) => {
      const now = Date.now();
      if (now - lastProgressUpdateRef.current < 100) {
        return;
      }
      lastProgressUpdateRef.current = now;
      setQueue((current) => current.map((entry) => entry.id === id ? { ...entry, progress: percent } : entry));
    };

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", item.file);

      if (item.albumId) {
        uploadForm.append("albumId", item.albumId);
      }

      const result = await uploadPhotoWithProgress(uploadForm, reportProgress);
      if (!result?.id) {
        throw new Error("Upload failed");
      }

      uploadRunSummaryRef.current.uploaded += 1;
      uploadedBatchPhotoIdsRef.current.push(result.id);
      setError(null);

      setQueue((current) => current.map((entry) => entry.id === id
        ? {
            ...entry,
            status: "uploaded",
            uploadedPhotoId: result.id,
            exifStatus: result.exifStatus ?? null,
            progress: 100,
            previewUrl: null,
            error: null,
          }
        : entry));
      revokePreviewUrl(item.previewUrl);
      setPhotos((current) => [result, ...current.filter((photo) => photo.id !== result.id)]);
      setSelectedPhotoId(result.id);
      const remainingQueued = queueRef.current.filter((entry) => entry.status === "queued" && entry.id !== id).length;
      setMessage(`Uploaded ${result.fileName}. ${remainingQueued} photo${remainingQueued === 1 ? "" : "s"} left in queue.`);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : "Upload failed";
      uploadRunSummaryRef.current.failed += 1;
      setQueue((current) => current.map((entry) => entry.id === id ? { ...entry, status: "failed", error: messageText } : entry));
      setError(messageText);
    }
  }

  return (
    <AdminShell title="Upload" subtitle="Choose a batch album once, then let the queue upload each image automatically one at a time." active="upload" stats={{ albums: albums.length, photos: photos.length, published: albums.filter((a) => a.isPublished).length }}>
      {(message || error) && (
        <div className={`rounded-2xl border p-4 ${error ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
          {error ?? message}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg">Batch upload</h2>
              <p className="text-sm text-white/50">Pick files, assign one album to the whole batch, then upload them automatically with sequential processing.</p>
            </div>
            <button type="button" className="text-sm text-white/50" onClick={refresh} disabled={loading || uploading}>Refresh</button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_260px]">
            <input
              aria-label="Queue photos"
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesSelected}
              className="block w-full text-sm rounded-xl border border-dashed border-white/15 bg-black/20 p-3"
            />
            <select
              aria-label="Upload album"
              value={selectedAlbumId}
              onChange={(event) => setSelectedAlbumId(event.target.value)}
              disabled={queueSummary.queued > 0 || queueSummary.uploading > 0 || creatingAlbum}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 disabled:opacity-50"
            >
              <option value="">No album</option>
              {albums.map((album) => <option key={album.id} value={album.id}>{album.name}</option>)}
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-white/45 text-xs uppercase tracking-[0.2em]">Batch album</p>
                <p className="mt-1 text-sm text-white/60">Need a new album first? Create it here, then queue the files into that draft album.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAlbumForm((current) => !current)}
                disabled={queueSummary.queued > 0 || queueSummary.uploading > 0 || creatingAlbum}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50"
              >
                {showCreateAlbumForm ? "Cancel" : "Create album"}
              </button>
            </div>
            {showCreateAlbumForm ? (
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  aria-label="New batch album name"
                  value={newAlbumName}
                  onChange={(event) => setNewAlbumName(event.target.value)}
                  placeholder="Album name"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
                <input
                  aria-label="New batch album description"
                  value={newAlbumDescription}
                  onChange={(event) => setNewAlbumDescription(event.target.value)}
                  placeholder="Description"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => void createBatchAlbum()}
                  disabled={creatingAlbum}
                  className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50"
                >
                  {creatingAlbum ? "Creating..." : "Create"}
                </button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Queued</p>
              <p className="mt-2 text-2xl font-semibold">{queueSummary.queued}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Uploading</p>
              <p className="mt-2 text-2xl font-semibold">{queueSummary.uploading}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Uploaded</p>
              <p className="mt-2 text-2xl font-semibold">{queueSummary.uploaded}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">Failed</p>
              <p className="mt-2 text-2xl font-semibold">{queueSummary.failed}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white/45 text-xs uppercase tracking-[0.2em]">Current queue</p>
                <p className="mt-1 text-sm text-white/60">
                  Batch album: {currentUpload?.albumName ?? queue.find((item) => item.albumName)?.albumName ?? "No album"}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={retryFailedUploads} disabled={uploading || queueSummary.failed === 0} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50">
                  Retry failed
                </button>
                <button type="button" onClick={clearQueue} disabled={uploading || queue.length === 0} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50">
                  Clear queue
                </button>
              </div>
            </div>

            {runSummary.total > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-white/45 uppercase tracking-[0.2em]">Batch progress</span>
                  <span className="text-white/70">{runSummary.done} of {runSummary.total} · {runSummary.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${runSummary.percent}%` }}
                  />
                </div>
                {activeUpload ? (
                  <>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="text-white/45 uppercase tracking-[0.2em]">Current file</span>
                      <span className="text-white/70">{activeProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-sky-400 transition-all duration-150"
                        style={{ width: `${activeProgress}%` }}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {currentUpload ? (
              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  {currentUpload.previewUrl ? (
                    <img src={currentUpload.previewUrl} alt={currentUpload.file.name} className="w-full rounded-2xl object-cover bg-black/30 aspect-[4/3]" />
                  ) : null}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/45 text-xs uppercase tracking-[0.2em]">Current item</p>
                    <h3 className="mt-1 text-lg font-medium">{currentUpload.file.name}</h3>
                    <p className="mt-1 text-sm text-white/60">{getStatusLabel(currentUpload)}. Files are processed one at a time to keep memory usage predictable on the app service.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm space-y-2">
                    <p className="text-white/45 text-xs uppercase tracking-[0.2em]">Metadata workflow</p>
                    <p className="text-white/70">Uploads are intentionally metadata-light for MVP. After the batch finishes, open the photo manager to add descriptions, tags, and album cleanup.</p>
                    <a href="/admin/photos" className="inline-flex text-sm text-white underline underline-offset-4">Open photo manager</a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 text-sm text-white/60">
                Queue one or many photos and they will upload automatically in sequence.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {queue.map((item) => (
                <div key={item.id} className={`rounded-2xl border p-3 space-y-3 ${getStatusClassName(item)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.file.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] opacity-80 mt-1">{getStatusLabel(item)}</p>
                    </div>
                    <button type="button" onClick={() => removeQueuedItem(item.id)} disabled={item.status === "uploading"} className="text-xs opacity-80 hover:opacity-100 disabled:opacity-40">
                      Remove
                    </button>
                  </div>
                  {item.previewUrl ? <img src={item.previewUrl} alt={item.file.name} className="h-28 w-full rounded-xl object-cover bg-black/30" /> : null}
                  {item.status === "uploading" ? (
                    <div className="space-y-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-sky-400 transition-all duration-150" style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="text-[11px] text-white/50">{item.progress}% uploaded</p>
                    </div>
                  ) : null}
                  <p className="text-xs">Album: {item.albumName ?? "No album"}</p>
                  {item.exifStatus ? (
                    <div className="text-xs space-y-1">
                      <p>Taken at: {item.exifStatus.hasTakenAt ? "Detected" : "Missing"}</p>
                      <p>Location: {item.exifStatus.hasLocation ? "Detected" : "Missing"}</p>
                      <p>Camera model: {item.exifStatus.hasCameraModel ? "Detected" : "Missing"}</p>
                    </div>
                  ) : null}
                  {item.error ? <p className="text-xs">{item.error}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg">Recent uploads</h2>
            <a href="/admin/photos" className="text-sm text-white/50 hover:text-white">Open photo manager</a>
          </div>
          <div className="space-y-2 max-h-[620px] overflow-auto pr-1">
            {photos.slice(0, 12).map((photo) => (
              <button type="button" key={photo.id} onClick={() => setSelectedPhotoId(photo.id)} className={`w-full text-left rounded-2xl border px-3 py-3 transition ${selectedPhotoId === photo.id ? "border-white bg-white/10" : "border-white/10 bg-black/20 hover:bg-white/5"}`}>
                <div className="flex items-center gap-3">
                  <img src={photo.thumbnailUrl ?? photo.url} alt={photo.fileName} className="h-14 w-14 rounded-xl object-cover bg-black/30" loading="lazy" />
                  <div>
                    <div className="font-medium">{photo.fileName}</div>
                    <div className="text-white/50 text-sm">{photo.albumName ?? "No album"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedPhoto ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm space-y-1">
              <p className="text-white/70 uppercase tracking-[0.2em] text-xs">Detected metadata</p>
              <p><span className="text-white/45">Taken:</span> {new Date(selectedPhoto.takenAt).toLocaleString()}</p>
              <p><span className="text-white/45">Location:</span> {selectedPhoto.location ?? "Not detected"}</p>
              <p><span className="text-white/45">Camera:</span> {selectedPhoto.cameraModel ?? "Not detected"}</p>
              <p><span className="text-white/45">Size:</span> {selectedPhoto.width} × {selectedPhoto.height}</p>
            </div>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
}
