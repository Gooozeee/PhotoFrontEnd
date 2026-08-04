import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";
import { IoPause, IoPlay } from "react-icons/io5";

const MIN_ROTATION_MS = 3200;
const MAX_ROTATION_MS = 7800;

function nextRandomIndex(current: number, length: number) {
  if (length < 2) return current;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * length);
  return next;
}

const HighlightsStrip = () => {
  const shouldReduceMotion = useReducedMotion();
  const { photos, loading, error } = useHighlights(12);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const selected = photos.find((photo) => photo.id === selectedId) ?? null;
  const activePhoto = photos[activeIndex % Math.max(photos.length, 1)];

  useEffect(() => {
    if (photos.length > 0) setActiveIndex(Math.floor(Math.random() * photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (shouldReduceMotion || paused || photos.length < 2) return;

    let timer: number;
    const scheduleNext = () => {
      const delay = MIN_ROTATION_MS + Math.random() * (MAX_ROTATION_MS - MIN_ROTATION_MS);
      timer = window.setTimeout(() => {
        setActiveIndex((index) => nextRandomIndex(index % photos.length, photos.length));
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => window.clearTimeout(timer);
  }, [paused, photos.length, shouldReduceMotion]);

  if (loading && photos.length === 0) {
    return <div className="bg-[#09090B] px-4 py-10 sm:px-6 md:px-8"><div role="status" className="mx-auto aspect-[16/8] max-w-5xl animate-pulse rounded-[2rem] border border-white/10 bg-white/5" /></div>;
  }

  if ((error && photos.length === 0) || !activePhoto) return null;

  return (
    <section className="bg-[#09090B] px-4 pb-12 sm:px-6 sm:pb-16 md:px-8">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume featured image rotation" : "Pause featured image rotation"} className="absolute sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-24 focus:z-40 focus:rounded-full focus:bg-white focus:p-3 focus:text-black">
          {paused ? <IoPlay size={18} /> : <IoPause size={18} />}
        </button>
        <div
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
          }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.button
              key={activePhoto.id}
              type="button"
              onClick={() => setSelectedId(activePhoto.id)}
              className="group relative block aspect-[16/9] w-full cursor-pointer overflow-hidden p-0 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/70"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeInOut" }}
              aria-label={`View larger highlight ${clampCaption(activePhoto.caption) ?? activePhoto.fileName}`}
            >
              <img
                src={getPreviewImageUrl(activePhoto.thumbnailUrl) ?? activePhoto.thumbnailUrl ?? activePhoto.url}
                alt={clampCaption(activePhoto.caption) ?? activePhoto.fileName}
                className={`h-full w-full object-cover ${shouldReduceMotion ? "" : "transition-transform duration-700 group-hover:scale-105"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                <p className="max-w-2xl text-lg font-medium text-white sm:text-2xl">{clampCaption(activePhoto.caption) ?? activePhoto.fileName}</p>
              </div>
            </motion.button>
          </AnimatePresence>
        </div>
      </div>

      {selected ? <ImageModal imageUrl={selected.url} caption={clampCaption(selected.caption)} tags={selected.tags} showTags={false} photoId={selected.id} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
};

export default HighlightsStrip;
