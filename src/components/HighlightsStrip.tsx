import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";

const ROTATION_MS = 5200;

const HighlightsStrip = () => {
  const shouldReduceMotion = useReducedMotion();
  const { photos, loading, error } = useHighlights(12);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const selected = photos.find((photo) => photo.id === selectedId) ?? null;
  const activePhoto = photos.length > 0 ? photos[activeIndex % photos.length] : null;

  useEffect(() => {
    if (photos.length === 0) return;
    setActiveIndex(Math.floor(Math.random() * photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (shouldReduceMotion || paused || photos.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % photos.length), ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [paused, photos.length, shouldReduceMotion]);

  if (loading && photos.length === 0) {
    return <div className="bg-[#09090B] mx-auto px-4 sm:px-6 md:px-8 py-10"><div role="status" className="mx-auto h-64 max-w-5xl animate-pulse rounded-[2rem] border border-white/10 bg-white/5" /></div>;
  }

  if ((error && photos.length === 0) || !activePhoto) return null;

  return (
    <section className="bg-[#09090B] mx-auto px-4 sm:px-6 md:px-8 pb-12 sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Curated by the camera</p>
            <h2 className="mt-2 text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight text-white">Best images</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/35 sm:block">{photos.length} highlights · {paused ? "paused" : "auto-rotating"}</span>
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? "Resume highlight rotation" : "Pause highlight rotation"}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
        >
          <AnimatePresence initial={false}>
            <motion.button
              key={activePhoto.id}
              type="button"
              onClick={() => setSelectedId(activePhoto.id)}
              className="group relative block aspect-[16/9] w-full cursor-pointer overflow-hidden p-0 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/70"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeInOut" }}
              aria-label={`View larger featured image: ${clampCaption(activePhoto.caption) ?? activePhoto.fileName}`}
            >
              <img
                src={getPreviewImageUrl(activePhoto.thumbnailUrl) ?? activePhoto.thumbnailUrl ?? activePhoto.url}
                alt={clampCaption(activePhoto.caption) ?? activePhoto.fileName}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
                <div>
                  <p className="text-lg font-medium text-white sm:text-2xl">{clampCaption(activePhoto.caption) ?? activePhoto.fileName}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/55">Click to view larger · similar images inside</p>
                </div>
                {activePhoto.rating != null ? <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-sm text-white">{activePhoto.rating}/10</span> : null}
              </div>
            </motion.button>
          </AnimatePresence>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5" aria-label="Highlight slides">
          {photos.slice(0, 12).map((photo, index) => (
            <button key={photo.id} type="button" aria-label={`Show highlight ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === activeIndex % photos.length ? "w-8 bg-white" : "w-2 bg-white/25 hover:bg-white/60"}`} />
          ))}
        </div>
      </div>

      {selected ? <ImageModal imageUrl={selected.url} caption={clampCaption(selected.caption)} tags={selected.tags} photoId={selected.id} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
};

export default HighlightsStrip;
