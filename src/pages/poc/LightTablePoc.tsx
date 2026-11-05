import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import paiCanyon from "../../assets/Landscapes/Pai Canyon Rain 2023.webp";
import rathlinSunset from "../../assets/Landscapes/Rathlin Island Sunset 2023.webp";
import { getPreviewImageUrl } from "../../utils/getPreviewImageUrl";
import { useArchiveSeries, type ArchiveSeries } from "./useArchiveSeries";

const HOUSE_EASE = [0.22, 1, 0.36, 1] as const;

type Series = ArchiveSeries;

const PRINT_POSITIONS = [
  { left: "3%", top: "4%", width: "33%", rotate: -3.2 },
  { left: "41%", top: "0%", width: "26%", rotate: 2.4 },
  { left: "70%", top: "11%", width: "25%", rotate: -1.6 },
  { left: "24%", top: "52%", width: "39%", rotate: 1.8 },
];

function buildPrintPositions(count: number) {
  if (count <= PRINT_POSITIONS.length) {
    return PRINT_POSITIONS.slice(0, count);
  }

  const columns = count <= 6 ? 3 : 4;
  const rows = Math.ceil(count / columns);

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      left: `${(column / columns) * 100 + 2}%`,
      top: `${(row / rows) * 86 + 2}%`,
      width: `${100 / columns - 4}%`,
      rotate: index % 2 === 0 ? -1.8 : 1.8,
    };
  });
}

const MOBILE_PRINT_ROTATIONS = [-2.4, 1.8, -1.2, 2.2];

type PrintPosition = { left: string; top: string; width: string; rotate: number };

function Print({
  series,
  position,
  isFeature,
  onOpen,
}: {
  series: Series;
  position: PrintPosition;
  isFeature: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${series.title} series`}
      className={`group absolute cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-8 focus-visible:ring-offset-[#E9E2D6] ${
        isFeature ? "z-20" : "z-10 hover:z-30"
      }`}
      style={{ left: position.left, top: position.top, width: position.width }}
      initial={{ rotate: position.rotate, y: 0 }}
      whileHover={{ y: -14, scale: 1.02 }}
      whileFocus={{ y: -14, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <div className="overflow-hidden bg-white p-2 shadow-[0_18px_50px_rgba(18,14,8,0.18)] [backface-visibility:hidden]">
        <img
          src={series.cover}
          alt={`${series.title}, ${series.year}`}
          className={`w-full object-cover [backface-visibility:hidden] ${isFeature ? "aspect-[4/3]" : "aspect-[3/2]"}`}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-display text-[clamp(1.1rem,1.6vw,1.7rem)] leading-none tracking-[-0.02em]">{series.title}</span>
        <span className="text-[11px] tabular-nums text-black/40">{series.year}</span>
      </div>
      <p className="mt-1 line-clamp-1 text-[11px] text-black/45">{series.place}</p>
    </motion.button>
  );
}

function MobilePrint({ series, index, onOpen }: { series: Series; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open ${series.title} series`}
      className="group w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-8 focus-visible:ring-offset-[#E9E2D6]"
      initial={{ rotate: MOBILE_PRINT_ROTATIONS[index % MOBILE_PRINT_ROTATIONS.length] }}
      whileTap={{ scale: 0.985, rotate: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <div className="overflow-hidden bg-white p-2 shadow-[0_18px_50px_rgba(18,14,8,0.18)]">
        <img src={series.cover} alt={`${series.title}, ${series.place}`} className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <span className="font-display text-2xl leading-none tracking-[-0.02em]">{series.title}</span>
        <span className="text-[11px] tabular-nums text-black/40">{series.year}</span>
      </div>
      <p className="mt-1 line-clamp-1 text-[11px] text-black/45">{series.place}</p>
    </motion.button>
  );
}

function SeriesViewer({ series, onClose }: { series: Series; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const images = series.images;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIndex((current) => (current + 1) % images.length);
      if (event.key === "ArrowLeft") setIndex((current) => (current - 1 + images.length) % images.length);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [images.length, onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    // Decode only the current and next frame so opening a series does not
    // download every full-size image at once.
    const sources = [images[index], images[(index + 1) % images.length]].filter(Boolean);
    for (const source of sources) {
      const image = new Image();
      image.decoding = "async";
      image.src = source;
    }
  }, [images, index]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${series.title} series`}
      className="fixed inset-0 z-[100] h-[100dvh] bg-[#0B0B0C] text-white"
      initial={{ clipPath: "circle(0% at 50% 50%)" }}
      animate={{ clipPath: "circle(150% at 50% 50%)" }}
      exit={{ clipPath: "circle(0% at 50% 50%)" }}
      transition={{ duration: 0.75, ease: HOUSE_EASE }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={`${series.title}, frame ${index + 1}`}
          className="absolute inset-0 h-full w-full object-contain px-3 pb-36 pt-20 md:p-8"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: HOUSE_EASE }}
          decoding="async"
        />

        <div
          className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent px-5 pb-6 md:p-8"
          style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        >
          <div>
            <p className="font-display text-2xl leading-none tracking-[-0.02em]">{series.title}</p>
            <p className="mt-2 text-xs text-white/45">{series.year}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="min-h-11 cursor-pointer rounded-full border border-white/20 px-4 py-3 text-xs text-white/70 transition hover:border-white/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Close
          </button>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pt-8 md:p-8"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md text-sm leading-6 text-white/60">{series.caption}</p>
            <p className="text-sm tabular-nums text-white/60">{index + 1} / {images.length}</p>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {images.map((source, imageIndex) => (
              <button
                key={`${source}-${imageIndex}`}
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Go to frame ${imageIndex + 1}`}
                className={`h-14 w-20 shrink-0 cursor-pointer overflow-hidden border transition ${
                  imageIndex === index ? "border-white opacity-100" : "border-white/15 opacity-45 hover:opacity-100"
                }`}
              >
                <img src={getPreviewImageUrl(source) ?? source} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LightTablePoc({ standalone = true }: { standalone?: boolean }) {
  const reduceMotion = Boolean(useReducedMotion());
  const [activeSeries, setActiveSeries] = useState<Series | null>(null);
  const { series, loading: archiveLoading, error: archiveError } = useArchiveSeries();
  const printPositions = useMemo(() => buildPrintPositions(series.length), [series.length]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = standalone ? "The Light Table POC" : "Michal Guzy, Photographer";
    return () => {
      document.title = previousTitle;
    };
  }, [standalone]);

  return (
    <main className="min-h-screen bg-[#0B0B0C] text-[#E9E2D6]">
      {standalone ? (
        <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0B0B0C]/90 px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">POC</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="text-sm text-white/80">The Light Table</span>
          </div>
          <Link to="/" className="text-sm text-white/55 transition-colors hover:text-white">
            Back to site
          </Link>
        </header>
      ) : null}

      <section className="relative min-h-[100svh] overflow-hidden bg-[#0B0B0C]">
        <motion.img
          src={paiCanyon}
          alt="Pai Canyon after rain, Thailand"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.1, ease: HOUSE_EASE }}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />

        {!reduceMotion ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.1, times: [0, 0.08, 0.7, 1], ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-y-0 w-[45%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-60%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 1.7, delay: 0.15, ease: HOUSE_EASE }}
            />
          </motion.div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-10 md:px-10 md:pb-14">
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.2, ease: HOUSE_EASE }}
          >
            <p className="mb-4 text-sm text-white/60">Photographer, Software Engineer</p>
            <h1 className="font-display text-[clamp(3.25rem,15vw,6rem)] leading-[0.82] tracking-[-0.055em] text-white md:text-[clamp(3.5rem,10vw,9rem)]">
              Michal
              <br />
              Guzy
            </h1>
            <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4 text-sm text-white/55">
              <p>Mostly outside.</p>
              <p className="tabular-nums">Pai Canyon · Thailand · 2023</p>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/35 md:flex md:right-10">
          <span style={{ writingMode: "vertical-rl" }}>Scroll</span>
          <span className="block h-10 w-px bg-white/30" />
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#E9E2D6] px-5 pb-24 pt-24 text-[#0B0B0C] md:px-10 md:pb-32 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,255,255,0.9),transparent_62%)]" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="flex items-end justify-between gap-6 border-b border-black/10 pb-6">
            <h2 className="font-display text-[clamp(2.6rem,6vw,5.4rem)] leading-none tracking-[-0.045em]">Selected work</h2>
            <a href="#full-archive" className="pb-2 text-[11px] uppercase tracking-[0.25em] text-black/35 transition-colors hover:text-black/70">
              All images ↓
            </a>
          </div>
          <div className="mt-6">
            <p className="max-w-xl text-sm leading-6 text-black/60">
              Hover a print to pick it up. Click to open the sequence.
            </p>
            {archiveLoading ? (
              <p className="mt-3 text-xs text-black/45">Fetching the live archive…</p>
            ) : archiveError ? (
              <p className="mt-3 text-xs text-black/45">{archiveError}</p>
            ) : null}
          </div>

          <div
            className="relative mt-14 hidden h-[72vh] min-h-[640px] md:block"
            data-testid="light-table"
            style={{ minHeight: series.length > 8 ? 840 : undefined }}
          >
            <div className="absolute inset-0">
              {series.map((item, index) => (
                <Print
                  key={item.id}
                  series={item}
                  position={printPositions[index]}
                  isFeature={index === 0}
                  onOpen={() => setActiveSeries(item)}
                />
              ))}
            </div>
            <p className="absolute bottom-0 left-0 text-[11px] text-black/35">Hover a print</p>
          </div>

          <div className="mt-10 grid gap-8 md:hidden">
            {series.map((item, index) => (
              <MobilePrint key={item.id} series={item} index={index} onOpen={() => setActiveSeries(item)} />
            ))}
          </div>

          <div id="full-archive" className="mt-16 scroll-mt-24 border-t border-black/10 pt-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">Full archive</p>
                <h3 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none tracking-[-0.04em]">
                  All images.
                </h3>
              </div>
              <p className="max-w-sm text-sm leading-6 text-black/55">
                The light table is the short edit. Open an album below for the full set.
              </p>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {series.map((item) => (
                <Link
                  key={item.id}
                  to={`/singleAlbum?album=${encodeURIComponent(item.title)}`}
                  className="group flex items-center justify-between border-t border-black/15 py-4 text-sm transition-colors hover:border-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9E2D6]"
                >
                  <span className="font-display text-xl tracking-[-0.02em]">{item.title}</span>
                  <span aria-hidden className="text-black/35 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B0B0C] px-5 py-24 text-[#E9E2D6] md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <h2 className="font-display text-[clamp(2.8rem,6.5vw,6.4rem)] leading-[0.92] tracking-[-0.05em]">
            I take photographs.
            <br />
            Mostly outside.
          </h2>
          <div className="max-w-md space-y-5 self-end text-sm leading-6 text-white/55">
            <p>Sometimes at a racetrack. I build software for a living.</p>
            {standalone ? (
              <Link to="/" className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-white/80 transition-colors hover:border-white hover:text-white">
                Back to the real site <span aria-hidden>→</span>
              </Link>
            ) : (
              <Link to="/software" className="inline-flex items-center gap-2 border-b border-white/25 pb-1 text-white/80 transition-colors hover:border-white hover:text-white">
                How this site is built <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="relative min-h-[72vh] overflow-hidden bg-[#0B0B0C]">
        <img src={rathlinSunset} alt="Rathlin Island at sunset" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/30 to-transparent" />
        <div className="relative flex min-h-[72vh] flex-col justify-end p-5 md:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">End of roll</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="font-display text-[clamp(2rem,5vw,4.2rem)] leading-[0.95] tracking-[-0.04em] text-white">
                Prints and commissions.
              </h2>
              <p className="mt-3 max-w-sm text-sm text-white/55">For prints, a shoot, or a question, email me.</p>
            </div>
            <div className="flex flex-wrap gap-5 pb-2 text-sm text-white/60">
              <a href="mailto:michalguzym@gmail.com" className="transition-colors hover:text-white">Email</a>
              <a href="https://github.com/Gooozeee" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">GitHub</a>
              <a href="https://www.linkedin.com/in/michal-guzy/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">LinkedIn</a>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] uppercase tracking-[0.25em] text-white/30">
            <span>Michal Guzy</span>
            <span>{standalone ? "Light table POC" : "De Goose Productions"}</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeSeries ? <SeriesViewer series={activeSeries} onClose={() => setActiveSeries(null)} /> : null}
      </AnimatePresence>
    </main>
  );
}
