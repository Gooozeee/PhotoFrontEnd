import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";

const ROTATION_MS = 4200;
const GRID_SLOTS = 8;

const HighlightsStrip = () => {
  const shouldReduceMotion = useReducedMotion();
  const { photos, loading, error } = useHighlights(12);
  const [offset, setOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const selected = photos.find((photo) => photo.id === selectedId) ?? null;

  useEffect(() => {
    if (photos.length > 0) setOffset(Math.floor(Math.random() * photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (shouldReduceMotion || paused || photos.length < 2) return;
    const timer = window.setInterval(() => setOffset((value) => (value + 1) % photos.length), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [paused, photos.length, shouldReduceMotion]);

  if (loading && photos.length === 0) {
    return <div className="bg-[#09090B] px-4 py-10 sm:px-6 md:px-8"><div role="status" className="mx-auto h-64 max-w-5xl animate-pulse rounded-[2rem] border border-white/10 bg-white/5" /></div>;
  }

  if ((error && photos.length === 0) || photos.length === 0) return null;

  return (
    <section className="bg-[#09090B] px-4 pb-12 sm:px-6 sm:pb-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Curated by the camera</p>
            <h2 className="mt-2 text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight text-white">Best images</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/35 sm:block">{photos.length} highlights · {paused ? "paused" : "auto-rotating"}</span>
            <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume highlight rotation" : "Pause highlight rotation"} className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60">
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-2 grid-rows-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
          }}
        >
          {Array.from({ length: GRID_SLOTS }, (_, slot) => {
            const photo = photos[(offset + slot) % photos.length];
            const visibility = slot < 4 ? "" : slot < 6 ? "hidden sm:block" : "hidden lg:block";
            return (
              <div key={slot} className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${visibility}`}>
                <AnimatePresence initial={false} mode="wait">
                  <motion.button
                    key={`${slot}-${photo.id}`}
                    type="button"
                    onClick={() => setSelectedId(photo.id)}
                    className="group absolute inset-0 block h-full w-full cursor-pointer overflow-hidden p-0 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/70"
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeInOut" }}
                    aria-label={`View larger highlight ${clampCaption(photo.caption) ?? photo.fileName}`}
                  >
                    <img src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url} alt={clampCaption(photo.caption) ?? photo.fileName} className={`h-full w-full object-cover ${shouldReduceMotion ? "" : "transition-transform duration-500 group-hover:scale-105"}`} loading={slot < 4 ? "eager" : "lazy"} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                      <span className="line-clamp-1 text-xs font-medium text-white sm:text-sm">{clampCaption(photo.caption) ?? photo.fileName}</span>
                      {photo.rating != null ? <span className="shrink-0 rounded-full border border-white/20 bg-black/45 px-2 py-0.5 text-[10px] text-white">{photo.rating}/10</span> : null}
                    </div>
                  </motion.button>
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.25em] text-white/35">Images roll through the grid every few seconds · hover to pause</p>
      </div>

      {selected ? <ImageModal imageUrl={selected.url} caption={clampCaption(selected.caption)} rating={selected.rating} tags={selected.tags} showTags={false} photoId={selected.id} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
};

export default HighlightsStrip;
