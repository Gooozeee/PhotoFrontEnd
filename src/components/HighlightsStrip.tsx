import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import { clampCaption } from "./ImageModal";

const HighlightsStrip = () => {
  const shouldReduceMotion = useReducedMotion();
  const { photos, loading, error } = useHighlights(12);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = photos.find((photo) => photo.id === selectedId) ?? null;

  if (loading && photos.length === 0) {
    return (
      <div className="bg-[#09090B] mx-auto px-4 sm:px-6 md:px-8 pb-10">
        <div role="status" className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="aspect-[3/2] w-48 shrink-0 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if ((error && photos.length === 0) || photos.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#09090B] mx-auto px-4 sm:px-6 md:px-8 pb-10 sm:pb-14">
      <motion.h2
        className="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold mb-4 tracking-tight text-white"
        style={{ fontFamily: "'Archivo', sans-serif" }}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        Best of the collection
      </motion.h2>

      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
        {photos.map((photo, index) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => setSelectedId(photo.id)}
            className="relative shrink-0 w-44 sm:w-56 aspect-[3/2] overflow-hidden rounded-xl border border-white/10 bg-white/5 cursor-pointer p-0 group"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            aria-label={`View ${clampCaption(photo.caption) ?? photo.fileName}`}
          >
            <img
              src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url}
              alt={clampCaption(photo.caption) ?? photo.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6 text-left text-white text-xs font-light tracking-wide line-clamp-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {clampCaption(photo.caption) ?? photo.fileName}
            </span>
          </motion.button>
        ))}
      </div>

      {selected ? (
        <ImageModal
          imageUrl={selected.url}
          caption={clampCaption(selected.caption)}
          tags={selected.tags}
          photoId={selected.id}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
};

export default HighlightsStrip;
