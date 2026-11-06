interface ArchiveStateProps {
  title: string;
  message: string;
  loading?: boolean;
  onRetry?: () => void;
}

export default function ArchiveState({ title, message, loading = false, onRetry }: ArchiveStateProps) {
  return (
    <main className="min-h-screen bg-[#E9E2D6] px-5 py-24 text-[#0B0B0C] md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">The archive</p>
        <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.8rem,7vw,6rem)] leading-[0.92] tracking-[-0.05em]">
          {title}
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-black/55">{message}</p>

        {loading ? (
          <>
            <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-black/40" role="status">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#D9482B]" />
              Waiting for the API
            </div>
            <div aria-hidden="true" className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="bg-white p-2 shadow-[0_14px_40px_rgba(18,14,8,0.1)]">
                  <div className="aspect-[4/3] animate-pulse bg-black/5" />
                </div>
              ))}
            </div>
          </>
        ) : onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-8 cursor-pointer border-b border-black/30 pb-1 font-display text-xl text-black/70 transition-colors hover:border-black hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9E2D6]"
          >
            Try again
          </button>
        ) : null}
      </div>
    </main>
  );
}
