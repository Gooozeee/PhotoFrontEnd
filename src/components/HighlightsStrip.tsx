import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";

const SLOT_COUNT = 6;
const MIN_ROTATION_MS = 4200;
const MAX_ROTATION_MS = 6200;

function randomDelay() {
  return MIN_ROTATION_MS + Math.random() * (MAX_ROTATION_MS - MIN_ROTATION_MS);
}

function chooseNext(current: number, unavailable: number[], length: number) {
  const candidates = Array.from({ length }, (_, index) => index).filter((index) => index !== current && !unavailable.includes(index));
  const pool = candidates.length > 0 ? candidates : Array.from({ length }, (_, index) => index).filter((index) => index !== current);
  return pool[Math.floor(Math.random() * pool.length)] ?? current;
}

const HighlightsStrip = () => {
  const shouldReduceMotion = useReducedMotion();
  const { photos, loading, error } = useHighlights(12);
  const [slides, setSlides] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = photos.find((photo) => photo.id === selectedId) ?? null;

  useEffect(() => {
    if (photos.length === 0) return;
    setSlides(Array.from({ length: Math.min(SLOT_COUNT, photos.length) }, (_, index) => index));
  }, [photos.length]);

  useEffect(() => {
    if (shouldReduceMotion || paused || slides.length === 0 || photos.length < 2) return;

    const timer = window.setTimeout(() => {
      setSlides((current) => {
        const changedSlots = new Set<number>();
        while (changedSlots.size < Math.min(2, current.length)) {
          changedSlots.add(Math.floor(Math.random() * current.length));
        }

        const unavailable = current.filter((_, slot) => !changedSlots.has(slot));
        const next = [...current];
        for (const slot of changedSlots) {
          const replacement = chooseNext(current[slot] ?? 0, [...unavailable, ...next.filter((_, index) => changedSlots.has(index))], photos.length);
          next[slot] = replacement;
        }
        return next;
      });
    }, randomDelay());

    return () => window.clearTimeout(timer);
  }, [paused, photos.length, shouldReduceMotion, slides]);

  if (loading && photos.length === 0) {
    return <div className="bg-[#09090B] px-4 py-10 sm:px-6 md:px-8"><div role="status" className="h-[calc(100svh-90px)] min-h-[420px] animate-pulse border border-white/10 bg-white/5" /></div>;
  }

  if ((error && photos.length === 0) || slides.length === 0) return null;

  return (
    <section className="relative h-[calc(100svh-90px)] min-h-[520px] w-full bg-[#09090B] px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="pointer-events-none absolute left-5 top-4 z-10 sm:left-8 sm:top-6">
        <h2 className="text-xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-2xl">Highlights</h2>
      </div>
      <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume highlights rotation" : "Pause highlights rotation"} className="absolute right-5 top-4 z-20 cursor-pointer rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/70 sm:right-8 sm:top-6">
        {paused ? "Resume" : "Pause"}
      </button>

      <div className="grid h-full grid-cols-2 grid-rows-2 gap-2 md:grid-cols-3 sm:gap-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
        {slides.map((photoIndex, slot) => {
          const photo = photos[photoIndex];
          if (!photo) return null;
          const visibility = slot < 4 ? "" : "hidden md:block";
          return (
            <article key={slot} className={`flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl bg-white/5 ${visibility}`}>
              <div className="relative min-h-0 flex-1 overflow-hidden">
                <AnimatePresence initial={false} mode="wait">
                  <motion.button
                    key={`${slot}-${photo.id}`}
                    type="button"
                    onClick={() => setSelectedId(photo.id)}
                    className="group absolute inset-0 block h-full w-full cursor-pointer overflow-hidden bg-black/20 p-0 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/80"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeInOut" }}
                    aria-label={`View larger highlight ${clampCaption(photo.caption) ?? photo.fileName}`}
                  >
                    <img src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url} alt={clampCaption(photo.caption) ?? photo.fileName} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" loading={slot < 3 ? "eager" : "lazy"} />
                  </motion.button>
                </AnimatePresence>
              </div>
              <p className="line-clamp-2 min-h-10 shrink-0 px-3 py-2 text-xs leading-relaxed text-white/70 sm:text-sm">{clampCaption(photo.caption) ?? photo.fileName}</p>
            </article>
          );
        })}
      </div>

      {selected ? <ImageModal imageUrl={selected.url} caption={clampCaption(selected.caption)} tags={selected.tags} showTags={false} photoId={selected.id} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
};

export default HighlightsStrip;
