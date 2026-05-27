import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImageGallery } from "../hooks/useImageGallery";

type PhotoItem = {
  id: string;
  fileName: string;
  albumName: string | null;
  description: string | null;
  tags: string[];
  takenAt: string;
  importedAt: string;
  href: string;
  score: number;
};

function includesTerm(value: string | null | undefined, term: string) {
  return (value ?? "").toLowerCase().includes(term);
}

function scorePhoto(photo: { description: string | null; tags: string[]; albumName: string | null; takenAt: string; importedAt: string }) {
  const descriptionScore = photo.description?.trim() ? 3 : 0;
  const tagScore = Math.min(photo.tags.length, 5) * 1.5;
  const albumScore = photo.albumName ? 1 : 0;
  const freshness = Number.isFinite(Date.parse(photo.takenAt))
    ? Math.max(0, 2 - (Date.now() - Date.parse(photo.takenAt)) / (1000 * 60 * 60 * 24 * 365))
    : 0;
  const importedScore = Number.isFinite(Date.parse(photo.importedAt))
    ? Math.max(0, 1 - (Date.now() - Date.parse(photo.importedAt)) / (1000 * 60 * 60 * 24 * 365))
    : 0;
  return descriptionScore + tagScore + albumScore + freshness + importedScore;
}

export default function DiscoverySearch() {
  const [query, setQuery] = useState("");
  const { images } = useImageGallery({ includePhotos: false, cacheKey: "home-discovery" });

  const items = useMemo<PhotoItem[]>(() => {
    return images
      .map((image) => ({
        id: image.id,
        fileName: image.caption ?? image.id,
        albumName: image.albumName ?? null,
        description: image.caption,
        tags: [],
        takenAt: image.importedAt,
        importedAt: image.importedAt,
        href: image.albumName ? `/singleAlbum?album=${encodeURIComponent(image.albumName)}` : "/",
        score: scorePhoto({
          description: image.caption,
          tags: [],
          albumName: image.albumName ?? null,
          takenAt: image.importedAt,
          importedAt: image.importedAt,
        }),
      }))
      .sort((a, b) => b.score - a.score || b.fileName.localeCompare(a.fileName));
  }, [images]);

  const search = query.trim().toLowerCase();
  const filtered = search
    ? items.filter((item) =>
        includesTerm(item.fileName, search) ||
        includesTerm(item.description, search) ||
        includesTerm(item.albumName, search)
      )
    : items.slice(0, 6);

  const featuredPhotos = items.slice(0, 3);
  const smartCollections = [
    { label: "Most described", items: items.filter((item) => item.description).slice(0, 3) },
    { label: "Recent highlights", items: [...items].sort((a, b) => b.score - a.score).slice(0, 3) },
    { label: "Album jump-ins", items: items.filter((item) => item.albumName).slice(0, 3) },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10 sm:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Discover</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Search your photos</h2>
            <p className="mt-2 text-sm text-white/60">Find photos by caption, tag, and album context. Albums are there when you need them, but the photos come first.</p>
          </div>
          <label className="w-full sm:max-w-sm">
            <span className="sr-only">Search photos</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search mountains, people, trips..."
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-white/30"
            />
          </label>
        </div>

        {!search && (
          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-end justify-between gap-4">
                <h3 className="text-lg text-white">Featured photos</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">AI metadata first</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {featuredPhotos.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/5"
                  >
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">photo</div>
                    <div className="mt-2 text-lg text-white">{item.fileName}</div>
                    <div className="mt-1 text-sm text-white/60 line-clamp-2">{item.description ?? item.albumName ?? "No description yet"}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <h3 className="text-lg text-white">Smart collections</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Heuristic ranking</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {smartCollections.map((group) => (
                  <div key={group.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">{group.label}</p>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10"
                        >
                          <div className="text-white font-medium">{item.fileName}</div>
                          <div className="text-xs text-white/55 line-clamp-1">{item.description ?? item.albumName ?? "No description yet"}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {search && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/5"
              >
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">photo</div>
                <div className="mt-2 text-lg text-white">{item.fileName}</div>
                <div className="mt-1 text-sm text-white/60 line-clamp-2">{item.description ?? item.albumName ?? "No description yet"}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
