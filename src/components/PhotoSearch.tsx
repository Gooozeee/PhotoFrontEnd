import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePhotoSearch } from "../hooks/useDiscovery";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import ImageModal from "./ImageModal";
import { clampCaption } from "./ImageModal";

const PhotoSearch = () => {
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { results, loading, error, searched } = usePhotoSearch(query);

  const selected = results.find((photo) => photo.id === selectedId) ?? null;

  return (
    <section className="bg-[#09090B] mx-auto px-4 sm:px-6 md:px-8 pb-10">
      <div className="mx-auto max-w-3xl">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection… try “snow”, “portrait”, “rally”"
            aria-label="Search photos"
            className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/30 focus:bg-white/10 transition-colors duration-300 text-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>

        {loading ? (
          <div role="status" className="mt-4 flex gap-2 flex-wrap">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-[3/2] w-32 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : searched && !error && results.length === 0 ? (
          <p className="mt-4 text-sm text-white/50 text-center">No matches for “{query}”.</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-300/80 text-center" role="alert">Search is unavailable right now.</p>
        ) : results.length > 0 ? (
          <motion.div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {results.map((photo, index) => (
              <motion.button
                key={photo.id}
                type="button"
                onClick={() => setSelectedId(photo.id)}
                className="relative aspect-[3/2] overflow-hidden rounded-lg border border-white/10 bg-white/5 cursor-pointer p-0 group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, delay: shouldReduceMotion ? 0 : Math.min(index * 0.03, 0.2) }}
                aria-label={`View ${clampCaption(photo.caption) ?? photo.fileName}`}
              >
                <img
                  src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url}
                  alt={clampCaption(photo.caption) ?? photo.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {photo.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4 text-left text-white text-[10px] font-light tracking-wide line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {clampCaption(photo.caption)}
                  </span>
                ) : null}
              </motion.button>
            ))}
          </motion.div>
        ) : null}
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
    </section>
  );
};

export default PhotoSearch;
