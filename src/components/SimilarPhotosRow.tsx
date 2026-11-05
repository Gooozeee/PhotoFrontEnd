import { motion } from "framer-motion";
import { useSimilarPhotos } from "../hooks/useDiscovery";
import type { DiscoveryPhoto } from "../lib/discoveryApi";

interface Props {
  photoId: string;
  onSelect?: (photoId: string) => void;
  onSelectPhoto?: (photo: DiscoveryPhoto) => void;
}

const SimilarPhotosRow = ({ photoId, onSelect, onSelectPhoto }: Props) => {
  const { photos, loading } = useSimilarPhotos(photoId);

  if (loading || photos.length === 0) {
    return null;
  }

  return (
    <div className="w-full border border-white/10 bg-[#0B0B0C]/95 px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">More like this</p>
        <p className="text-[10px] uppercase tracking-[0.18em] tabular-nums text-white/25">{photos.length} frames</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {photos.map((photo) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => {
              onSelect?.(photo.id);
              onSelectPhoto?.(photo);
            }}
            className="h-16 w-24 shrink-0 cursor-pointer overflow-hidden border border-white/10 bg-white/5 p-0.5 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:h-20 sm:w-32"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            aria-label={`View similar photo ${photo.fileName}`}
          >
            <img
              src={photo.thumbnailUrl ?? photo.url}
              alt={photo.fileName}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SimilarPhotosRow;
