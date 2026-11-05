export type UploadProgressBannerProps = {
  total: number;
  completed: number;
  failed?: number;
  currentFileName?: string | null;
  currentPercent?: number;
  label?: string;
};

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

/**
 * Sticky, always-visible upload feedback. The detailed per-file cards stay in
 * the queue, but this banner makes it obvious that work is still happening and
 * that refreshing will abort the remaining files.
 */
export function UploadProgressBanner({
  total,
  completed,
  failed = 0,
  currentFileName,
  currentPercent = 0,
  label = "Upload in progress",
}: UploadProgressBannerProps) {
  if (total <= 0) {
    return null;
  }

  const safeCompleted = Math.min(completed, total);
  const remaining = Math.max(total - safeCompleted, 0);
  const percent = Math.round((safeCompleted / total) * 100);
  const safeCurrentPercent = Math.min(Math.max(currentPercent, 0), 100);
  const waitingOnServer = Boolean(currentFileName) && safeCurrentPercent >= 100;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-4 z-40 space-y-3 rounded-2xl border border-sky-500/40 bg-[#0b1a2a]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200/70">{label}</p>
          <p className="mt-1 text-sm text-white/80">
            {formatCount(remaining, "file")} left · {safeCompleted} of {total} done
            {failed > 0 ? ` · ${formatCount(failed, "failure")}` : ""}
          </p>
        </div>
        <span className="text-2xl font-semibold tabular-nums text-white">{percent}%</span>
      </div>

      <div
        role="progressbar"
        aria-label="Batch upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {currentFileName ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate text-white/70">{currentFileName}</span>
            <span className="shrink-0 tabular-nums text-white/60">{safeCurrentPercent}% sent</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-sky-300 transition-all duration-150"
              style={{ width: `${safeCurrentPercent}%` }}
            />
          </div>
          {waitingOnServer ? (
            <p className="text-[11px] text-sky-200/70">Upload sent. Processing on the server…</p>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-amber-200/80">
        Keep this tab open. Refreshing or closing it cancels the files that are still queued.
      </p>
    </div>
  );
}
