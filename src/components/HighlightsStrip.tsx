import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";

const SLOT_COUNT = 6;
const MIN_ROTATION_MS = 4000;
const MAX_ROTATION_MS = 6000;

function randomDelay() {
  return MIN_ROTATION_MS + Math.random() * (MAX_ROTATION_MS - MIN_ROTATION_MS);
}

function choosePhoto(current: number, visible: number[], length: number) {
  const candidates = Array.from({ length }, (_, index) => index).filter((index) => index !== current && !visible.includes(index));
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
    const initial = Array.from({ length: Math.min(SLOT_COUNT, photos.length) }, (_, index) => index);
    setSlides(initial);
  }, [photos.length]);

  useEffect(() => {
    if (shouldReduceMotion || paused || slides.length === 0 || photos.length < 2) return;
    const timer = window.setTimeout(() => {
      setSlides((current) => {
        const slot = Math.floor(Math.random() * current.length);
        const visible = current.filter((_, index) => index !== slot);
        const next = choosePhoto(current[slot] ?? 0, visible, photos.length);
        return current.map((value, index) => (index === slot ? next : value));
      });
    }, randomDelay());
    return () => window.clearTimeout(timer);
  }, [paused, photos, shouldReduceMotion, slides]);

  if (loading && photos.length === 0) {
    return <div className="bg-[#09090B] px-4 py-10 sm:px-6 md:px-8"><div role="status" className="mx-auto h-64 max-w-5xl animate-pulse rounded-[2rem] border border-white/10 bg-white/5" /></div>;
  }

  if ((error && photos.length === 0) || slides.length === 0) return null;

  return (
    <section className="bg-[#09090B] px-4 pb-12 sm:px-6 sm:pb-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight text-white">Best images</h2>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume featured image rotation" : "Pause featured image rotation"} className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60">
            {paused ? "Resume" : "Pause"}
          </button>
        </div>

        <div className="grid grid-cols-2 items-start gap-2 md:grid-cols-3" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
          {slides.map((photoIndex, slot) => {
            const photo = photos[photoIndex];
            if (!photo) return null;
            return (
              <div key={slot} className="min-w-0">
                <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-white/5">
                  <AnimatePresence initial={false} mode="wait">
                    <motion.button
                      key={`${slot}-${photo.id}`}
                      type="button"
                      onClick={() => setSelectedId(photo.id)}
                      className="group absolute inset-0 block h-full w-full cursor-pointer overflow-hidden p-0 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/70"
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
                <p className="mt-2 line-clamp-2 px-1 text-xs leading-relaxed text-white/65 sm:text-sm">{clampCaption(photo.caption) ?? photo.fileName}</p>
              </div>
            );
          })}
        </div>
      </div>

      {selected ? <ImageModal imageUrl={selected.url} caption={clampCaption(selected.caption)} tags={selected.tags} showTags={false} photoId={selected.id} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
};

export default HighlightsStrip;
