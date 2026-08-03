import { motion } from "framer-motion";
import { useSimilarPhotos } from "../hooks/useDiscovery";
import type { DiscoveryPhoto } from "../lib/discoveryApi";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";

interface Props {
  photoId: string;
  onSelect: (photoId: string) => void;
  onSelectPhoto?: (photo: DiscoveryPhoto) => void;
}

const SimilarPhotosRow = ({ photoId, onSelect, onSelectPhoto }: Props) => {
  const { photos, loading } = useSimilarPhotos(photoId);

  if (loading || photos.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl px-5 py-4 bg-black/70 backdrop-blur-md rounded-2xl">
      <p className="mb-2.5 text-[10px] uppercase tracking-[0.25em] text-white/50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Similar photos
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {photos.map((photo) => (
          <motion.button
            key={photo.id}
            type="button"
            onClick={() => {
              onSelect(photo.id);
              onSelectPhoto?.(photo);
            }}
            className="shrink-0 w-24 sm:w-28 aspect-[3/2] overflow-hidden rounded-lg border border-white/10 bg-white/5 cursor-pointer p-0"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            aria-label={`View similar photo ${photo.fileName}`}
          >
            <img
              src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url}
              alt={photo.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SimilarPhotosRow;
