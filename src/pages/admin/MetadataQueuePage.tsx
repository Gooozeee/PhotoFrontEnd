import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "./AdminShell";
import { enqueueMetadata, loadAlbums, loadMetadataQueue, loadPhotos, resetMetadataQueue } from "./api";
import type { AdminAlbum, AdminPhoto, MetadataQueueItem } from "./types";

const STATE_STYLES: Record<MetadataQueueItem["state"], string> = {
  Pending: "border-white/10 bg-white/5 text-white/70",
  Processing: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  Completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  Failed: "border-red-500/30 bg-red-500/10 text-red-100",
};

export default function MetadataQueuePage() {
  const [albums, setAlbums] = useState<AdminAlbum[]>([]);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [queue, setQueue] = useState<MetadataQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [albumsData, photosData, queueData] = await Promise.all([loadAlbums(), loadPhotos(), loadMetadataQueue()]);
      setAlbums(albumsData);
      setPhotos(photosData);
      setQueue(queueData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load metadata queue");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetFailed() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await resetMetadataQueue();
      setMessage(`${result.reset} failed job${result.reset === 1 ? "" : "s"} reset to pending.`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEnqueue() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await enqueueMetadata();
      setMessage("Queued photos missing AI metadata.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enqueue failed");
    } finally {
      setBusy(false);
    }
  }

  const counts = useMemo(
    () => ({
      pending: queue.filter((item) => item.state === "Pending").length,
      processing: queue.filter((item) => item.state === "Processing").length,
      completed: queue.filter((item) => item.state === "Completed").length,
      failed: queue.filter((item) => item.state === "Failed").length,
    }),
    [queue]
  );

  return (
    <AdminShell
      title="AI Metadata"
      subtitle="Photos are captioned automatically. Reset failed jobs or queue new ones here."
      active="metadata"
      stats={{ albums: albums.length, photos: photos.length, published: albums.filter((a) => a.isPublished).length }}
    >
      {(message || error) && (
        <div className={`rounded-2xl border p-4 ${error ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
          {error ?? message}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">AI metadata queue</p>
            <h2 className="text-lg mt-2">Processing status</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void refresh()} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50" disabled={loading || busy}>
              Refresh
            </button>
            <button onClick={() => void handleEnqueue()} className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 transition disabled:opacity-50" disabled={loading || busy}>
              {busy ? "Working..." : "Queue missing"}
            </button>
            <button onClick={() => void handleResetFailed()} className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-100 hover:bg-red-500/20 transition disabled:opacity-50" disabled={loading || busy || counts.failed === 0}>
              {busy ? "Working..." : `Reset failed (${counts.failed})`}
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Pending", value: counts.pending },
            { label: "Processing", value: counts.processing },
            { label: "Completed", value: counts.completed },
            { label: "Failed", value: counts.failed },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-white/50">
          The hourly worker processes up to 25 photos per run at 12/min to stay within the Gemini free tier. Reset failed jobs to retry them; the run happens automatically on the hour.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <h2 className="text-lg">Jobs</h2>
          <span className="text-sm text-white/50">{queue.length} total</span>
        </div>
        <div className="space-y-2">
          {queue.map((item) => (
            <div key={item.photoId} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="truncate font-medium">{item.fileName}</div>
                  <div className="text-sm text-white/50 truncate">{item.albumName ?? "No album"}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${STATE_STYLES[item.state]}`}>{item.state}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                <span>Attempts: {item.attempts}</span>
                {item.completedAt ? <span>Done: {new Date(item.completedAt).toLocaleString()}</span> : null}
                {item.lastAttemptAt ? <span>Last attempt: {new Date(item.lastAttemptAt).toLocaleString()}</span> : null}
              </div>
              {item.lastError ? (
                <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100 break-all">{item.lastError}</div>
              ) : null}
            </div>
          ))}
          {queue.length === 0 && !loading && <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-sm text-white/60">No metadata jobs yet. Queue missing metadata to begin.</div>}
        </div>
      </section>
    </AdminShell>
  );
}
