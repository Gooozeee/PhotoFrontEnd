import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import type { DiscoveryPhoto } from "../lib/discoveryApi";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";
import { cappedAspectRatio, getHighlightRows, MAX_HIGHLIGHT_ASPECT } from "../utils/getHighlightRows";

const SLOT_COUNT = 8;
const MIN_ROTATION_MS = 4200;
const MAX_ROTATION_MS = 6200;
const CAPTION_HEIGHT_MOBILE = 52;
const CAPTION_HEIGHT_DESKTOP = 60;

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = photos.find((photo) => photo.id === selectedId) ?? null;

  useEffect(() => {
    if (photos.length > 0) setSlides(Array.from({ length: Math.min(SLOT_COUNT, photos.length) }, (_, index) => index));
  }, [photos.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof ResizeObserver === "undefined") {
      setDimensions({
        width: el.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 0),
        height: el.clientHeight || (typeof window !== "undefined" ? window.innerHeight : 0),
      });
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || slides.length === 0 || photos.length < 2) return;
    const timer = window.setTimeout(() => {
      setSlides((current) => {
        const changedSlots = new Set<number>();
        while (changedSlots.size < Math.min(2, current.length)) changedSlots.add(Math.floor(Math.random() * current.length));
        const unavailable = current.filter((_, slot) => !changedSlots.has(slot));
        const next = [...current];
        for (const slot of changedSlots) next[slot] = chooseNext(current[slot] ?? 0, [...unavailable, ...next.filter((_, index) => changedSlots.has(index))], photos.length);
        return next;
      });
    }, randomDelay());
    return () => window.clearTimeout(timer);
  }, [photos.length, shouldReduceMotion, slides]);

  const rows = useMemo(() => {
    if (slides.length === 0) return [];
    const sized = slides
      .map((index) => photos[index])
      .filter((photo): photo is DiscoveryPhoto => Boolean(photo));
    if (sized.length === 0) return [];
    const width = dimensions?.width || (typeof window !== "undefined" ? window.innerWidth : 0);
    const height = dimensions?.height || (typeof window !== "undefined" ? window.innerHeight : 0);
    const captionHeight = width < 640 ? CAPTION_HEIGHT_MOBILE : CAPTION_HEIGHT_DESKTOP;
    return getHighlightRows(sized, width, height, { captionHeight });
  }, [dimensions, photos, slides]);

  if (loading && photos.length === 0) return <div className="bg-[#09090B] px-4 py-10 sm:px-6 md:px-8"><div role="status" className="h-[calc(100svh-90px)] min-h-[420px] animate-pulse border border-white/10 bg-white/5" /></div>;
  if ((error && photos.length === 0) || slides.length === 0 || rows.length === 0) return null;

  function renderRow(row: DiscoveryPhoto[], rowIndex: number) {
    return (
      <div key={`row-${rowIndex}`} className="flex min-h-0 flex-1 gap-2 sm:gap-3">
        {row.map((photo, index) => {
          const ratio = cappedAspectRatio(photo, MAX_HIGHLIGHT_ASPECT);
          return (
            <figure key={`${rowIndex}-${index}`} className="flex min-w-0 flex-col" style={{ flexGrow: ratio, flexBasis: 0 }}>
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-white/5">
                <AnimatePresence initial={false} mode="wait">
                  <motion.button
                    key={`${rowIndex}-${index}-${photo.id}`}
                    type="button"
                    onClick={() => setSelectedId(photo.id)}
                    className="group absolute inset-0 block h-full w-full cursor-pointer overflow-hidden p-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/80"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: "easeInOut" }}
                    aria-label={`View larger highlight ${clampCaption(photo.caption) ?? photo.fileName}`}
                  >
                    <img src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url} alt={clampCaption(photo.caption) ?? photo.fileName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
                  </motion.button>
                </AnimatePresence>
              </div>
              <figcaption className="line-clamp-2 min-h-[3.25rem] shrink-0 px-1 pt-2 pb-1 text-xs leading-relaxed text-white/70 sm:min-h-[3.75rem] sm:text-sm">{clampCaption(photo.caption) ?? photo.fileName}</figcaption>
            </figure>
          );
        })}
      </div>
    );
  }

  return (
    <section className="w-full bg-[#09090B] px-2 pb-8 sm:px-4 sm:pb-10">
      <div className="mb-3 flex items-center px-1 sm:px-2"><h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Highlights</h2></div>
      <div ref={containerRef} className="flex h-[calc(100svh-150px)] min-h-[420px] flex-col gap-2 sm:h-[calc(100svh-170px)] sm:gap-3">
        {rows.map((row, rowIndex) => renderRow(row, rowIndex))}
      </div>
      {selected ? <ImageModal imageUrl={selected.url} caption={clampCaption(selected.caption)} tags={selected.tags} showTags={false} photoId={selected.id} onClose={() => setSelectedId(null)} /> : null}
    </section>
  );
};

export default HighlightsStrip;
