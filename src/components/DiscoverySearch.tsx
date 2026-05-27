import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImageGallery } from "../hooks/useImageGallery";

type DiscoveryItem = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  kind: "album";
  score: number;
};

function includesTerm(value: string | null | undefined, term: string) {
  return (value ?? "").toLowerCase().includes(term);
}

function scoreAlbum(album: { description: string | null; photosCount: number }) {
  const descriptionScore = album.description?.trim() ? 2 : 0;
  const sizeScore = Math.min(album.photosCount, 10) / 5;
  return descriptionScore + sizeScore;
}

export default function DiscoverySearch() {
  const [query, setQuery] = useState("");
  const { albums } = useImageGallery({ includePhotos: false, cacheKey: "home-discovery" });

  const items = useMemo<DiscoveryItem[]>(() => {
    return albums
      .map((album) => ({
        id: album.id,
        title: album.name,
        description: album.description,
        href: `/singleAlbum?album=${encodeURIComponent(album.name)}`,
        kind: "album" as const,
        score: scoreAlbum(album),
      }))
      .sort((a, b) => b.score - a.score || b.title.localeCompare(a.title));
  }, [albums]);

  const search = query.trim().toLowerCase();
  const filtered = search
    ? items.filter((item) => includesTerm(item.title, search) || includesTerm(item.description, search))
    : items.slice(0, 6);

  const highlighted = items.slice(0, 3);
  const smartGroups = [
    { label: "Most complete", items: items.filter((item) => item.description).slice(0, 3) },
    { label: "Largest collections", items: [...items].sort((a, b) => b.score - a.score).slice(0, 3) },
    { label: "Suggested first", items: items.slice(0, 3) },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10 sm:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Discover</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Search your library</h2>
            <p className="mt-2 text-sm text-white/60">Find albums, captions, and smart collections without digging through everything.</p>
          </div>
          <label className="w-full sm:max-w-sm">
            <span className="sr-only">Search albums</span>
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
                <h3 className="text-lg text-white">Smart collections</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Heuristic ranking</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {smartGroups.map((group) => (
                  <div key={group.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">{group.label}</p>
                    <div className="mt-3 space-y-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10"
                        >
                          <div className="text-white font-medium">{item.title}</div>
                          <div className="text-xs text-white/55 line-clamp-1">{item.description ?? "No description yet"}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <h3 className="text-lg text-white">Suggested albums</h3>
                <p className="text-xs uppercase tracking-[0.25em] text-white/35">Top picks</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {highlighted.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/5"
                  >
                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">album</div>
                    <div className="mt-2 text-lg text-white">{item.title}</div>
                    <div className="mt-1 text-sm text-white/60 line-clamp-2">{item.description ?? "No description yet"}</div>
                  </Link>
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
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{item.kind}</div>
                <div className="mt-2 text-lg text-white">{item.title}</div>
                <div className="mt-1 text-sm text-white/60 line-clamp-2">{item.description ?? "No description yet"}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
