import { useMemo, useState } from "react";
import { useHighlights } from "../hooks/useDiscovery";
import ImageModal from "./ImageModal";

type Shot = {
  id: string;
  albumId: string | null;
  albumName?: string | null;
};

function groupByAlbum<T extends Shot>(photos: T[]): T[][] {
  const groups = new Map<string, T[]>();

  photos.forEach((photo, index) => {
    const key = photo.albumName ?? photo.albumId ?? `unknown-${index}`;
    const group = groups.get(key) ?? [];
    group.push(photo);
    groups.set(key, group);
  });

  return [...groups.values()];
}

function pickShotSpread<T extends Shot>(photos: T[], limit: number): T[] {
  const groups = groupByAlbum(photos);
  const picked: T[] = [];
  let round = 0;

  while (picked.length < limit) {
    let added = false;
    for (const group of groups) {
      if (picked.length >= limit) return picked;
      const photo = group[round];
      if (!photo) continue;
      picked.push(photo);
      added = true;
    }
    if (!added) break;
    round += 1;
  }

  return picked;
}

function captionFor(photo: { caption: string | null; description: string | null; fileName: string }) {
  return photo.caption?.trim() || photo.description?.trim() || photo.fileName;
}

function BestShots({ limit = 6 }: { limit?: number }) {
  const { photos, loading } = useHighlights(Math.max(limit * 2, 12));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const shots = useMemo(() => pickShotSpread(photos, limit), [photos, limit]);
  const selected = selectedIndex === null ? null : shots[selectedIndex] ?? null;

  if (loading && photos.length === 0) {
    return (
      <section id="best-shots" className="mt-16 scroll-mt-24 border-t border-black/10 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">Best shots</p>
            <h3 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none tracking-[-0.04em]">
              A short edit from across the archive.
            </h3>
          </div>
          <p className="max-w-sm text-sm leading-6 text-black/55">Loading the short edit.</p>
        </div>
        <div aria-hidden="true" className="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
          {Array.from({ length: Math.min(limit, 6) }, (_, index) => (
            <div key={index} className="aspect-[4/3] animate-pulse bg-black/5" />
          ))}
        </div>
      </section>
    );
  }

  if (shots.length === 0) return null;

  const showNext = () => setSelectedIndex((current) => (current === null ? null : (current + 1) % shots.length));
  const showPrev = () => setSelectedIndex((current) => (current === null ? null : (current - 1 + shots.length) % shots.length));

  return (
    <section id="best-shots" className="mt-16 scroll-mt-24 border-t border-black/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-black/35">Best shots</p>
          <h3 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none tracking-[-0.04em]">
            A short edit from across the archive.
          </h3>
        </div>
        <p className="max-w-sm text-sm leading-6 text-black/55">Open one to see more like it.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3">
        {shots.map((photo, index) => {
          const caption = captionFor(photo);

          return (
            <figure key={photo.id}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Open ${caption}`}
                className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden border border-black/10 bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9482B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#E9E2D6]"
              >
                <img
                  src={photo.thumbnailUrl ?? photo.url}
                  alt={caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                  decoding="async"
                />
              </button>
              <figcaption className="mt-2 truncate text-[11px] leading-5 text-black/55">
                {caption}
                {photo.albumName ? <span className="text-black/35"> · {photo.albumName}</span> : null}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {selected ? (
        <ImageModal
          imageUrl={selected.url}
          imageIndex={(selectedIndex ?? 0) + 1}
          totalImages={shots.length}
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

export default BestShots;
