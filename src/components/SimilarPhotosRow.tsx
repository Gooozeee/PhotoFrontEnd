import { useMemo } from "react";
import { motion } from "framer-motion";
import { useSimilarPhotos } from "../hooks/useDiscovery";
import type { DiscoveryPhoto } from "../lib/discoveryApi";

const SIMILAR_POOL = 24;
const VISIBLE_SIMILAR = 8;

function pickSimilarSpread<T extends { id: string; albumId: string | null }>(photos: T[], limit: number): T[] {
  if (photos.length <= limit) return photos;

  const leading = Math.ceil(limit / 2);
  const picked = photos.slice(0, leading);
  const pickedIds = new Set(picked.map((photo) => photo.id));
  const leadingAlbums = new Set(picked.map((photo) => photo.albumId ?? photo.id));
  const otherAlbums = new Map<string, T[]>();
  const sameAlbum: T[] = [];

  for (const photo of photos.slice(leading)) {
    if (pickedIds.has(photo.id)) continue;
    const key = photo.albumId ?? photo.id;
    if (leadingAlbums.has(key)) {
      sameAlbum.push(photo);
      continue;
    }
    const group = otherAlbums.get(key) ?? [];
    group.push(photo);
    otherAlbums.set(key, group);
  }

  let round = 0;
  while (picked.length < limit && otherAlbums.size > 0) {
    let added = false;
    for (const group of otherAlbums.values()) {
      if (picked.length >= limit) break;
      const photo = group[round];
      if (!photo || pickedIds.has(photo.id)) continue;
      picked.push(photo);
      pickedIds.add(photo.id);
      added = true;
    }
    if (!added) break;
    round += 1;
  }

  for (const photo of sameAlbum) {
    if (picked.length >= limit) break;
    if (pickedIds.has(photo.id)) continue;
    picked.push(photo);
    pickedIds.add(photo.id);
  }

  return picked;
}

interface Props {
  photoId: string;
  onSelect?: (photoId: string) => void;
  onSelectPhoto?: (photo: DiscoveryPhoto) => void;
}

const SimilarPhotosRow = ({ photoId, onSelect, onSelectPhoto }: Props) => {
  const { photos, loading } = useSimilarPhotos(photoId, SIMILAR_POOL);
  const visible = useMemo(() => pickSimilarSpread(photos, VISIBLE_SIMILAR), [photos]);

  if (loading || visible.length === 0) {
    return null;
  }

  return (
    <div className="w-full border border-white/10 bg-[#0B0B0C]/95 px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">More like this</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">Click to swap</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {visible.map((photo) => (
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
