import { useMemo, useState } from "react";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";

type RatedPhoto = {
  id: string;
  albumId: string | null;
  albumName?: string | null;
};

function pickRatedSpread<T extends RatedPhoto>(photos: T[], limit: number): T[] {
  const groups = new Map<string, T[]>();

  photos.forEach((photo, index) => {
    const key = photo.albumName ?? photo.albumId ?? `unknown-${index}`;
    const group = groups.get(key) ?? [];
    group.push(photo);
    groups.set(key, group);
  });

  const picked: T[] = [];
  let round = 0;

  while (picked.length < limit) {
    let added = false;
    for (const group of groups.values()) {
      const photo = group[round];
      if (!photo) continue;
      picked.push(photo);
      added = true;
      if (picked.length === limit) return picked;
    }
    if (!added) break;
    round += 1;
  }

  return picked;
}

function captionFor(photo: { caption: string | null; description: string | null; fileName: string }) {
  return photo.caption?.trim() || photo.description?.trim() || photo.fileName;
}

function BestRated({ limit = 6 }: { limit?: number }) {
  const { photos, loading } = useHighlights(Math.max(limit * 2, 12));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const rated = useMemo(() => pickRatedSpread(photos, limit), [photos, limit]);
  const selected = selectedIndex === null ? null : rated[selectedIndex] ?? null;

  if (loading && photos.length === 0) {
    return (
      <section id="best-rated" className="mt-16 scroll-mt-24 border-t border-black/10 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">Best rated</p>
            <h3 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none tracking-[-0.04em]">
              The highest rated frames.
            </h3>
          </div>
          <p className="max-w-sm text-sm leading-6 text-black/55">Loading the archive edit.</p>
        </div>
        <div aria-hidden="true" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: Math.min(limit, 6) }, (_, index) => (
            <div key={index} className="aspect-[4/3] animate-pulse bg-black/5" />
          ))}
        </div>
      </section>
    );
  }

  if (rated.length === 0) return null;

  const showNext = () => setSelectedIndex((current) => (current === null ? null : (current + 1) % rated.length));
  const showPrev = () => setSelectedIndex((current) => (current === null ? null : (current - 1 + rated.length) % rated.length));

  return (
    <section id="best-rated" className="mt-16 scroll-mt-24 border-t border-black/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">Best rated</p>
          <h3 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none tracking-[-0.04em]">
            The highest rated frames.
          </h3>
        </div>
        <p className="max-w-sm text-sm leading-6 text-black/55">
          Rated in the archive. The edit spreads across series, and each one opens with more like it.
        </p>
      </div>

      <div className="mt-8 columns-2 gap-3 md:columns-3">
        {rated.map((photo, index) => {
          const caption = captionFor(photo);
          const thumbnail = photo.thumbnailUrl ?? photo.url;
          const preview = getPreviewImageUrl(photo.thumbnailUrl) ?? thumbnail;
          return (
            <figure key={photo.id} className="mb-3 break-inside-avoid">
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`View rated photo ${caption}`}
                className="group relative block w-full cursor-pointer overflow-hidden bg-white p-1.5 text-left shadow-[0_14px_40px_rgba(18,14,8,0.12)] transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(18,14,8,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9E2D6]"
              >
                <img
                  src={thumbnail}
                  srcSet={preview !== thumbnail ? `${thumbnail} 300w, ${preview} 1280w` : undefined}
                  sizes="(min-width: 1280px) 420px, (min-width: 768px) 30vw, 45vw"
                  alt={caption}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                  decoding="async"
                />
                {photo.rating != null ? (
                  <span className="absolute right-3 top-3 bg-[#0B0B0C]/90 px-2 py-1 text-[10px] uppercase tracking-[0.18em] tabular-nums text-[#E9E2D6]">
                    {photo.rating} / 10
                  </span>
                ) : null}
              </button>
              <figcaption className="mt-2 flex items-baseline justify-between gap-3 text-[11px] leading-5 text-black/55">
                <span className="line-clamp-1">{caption}</span>
                {photo.albumName ? <span className="shrink-0 text-black/35">{photo.albumName}</span> : null}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {selected ? (
        <ImageModal
          imageUrl={selected.url}
          imageIndex={(selectedIndex ?? 0) + 1}
          totalImages={rated.length}
          caption={selected.caption ?? selected.description}
          tags={selected.tags}
          photoId={selected.id}
          onClose={() => setSelectedIndex(null)}
          onNext={showNext}
          onPrev={showPrev}
        />
      ) : null}
    </section>
  );
}

export default BestRated;
