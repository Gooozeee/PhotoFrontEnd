import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useImageGallery } from "../hooks/useImageGallery";

type DiscoveryItem = {
  id: string;
  title: string;
  description: string | null;
  href: string;
  kind: "album" | "photo";
};

function includesTerm(value: string | null | undefined, term: string) {
  return (value ?? "").toLowerCase().includes(term);
}

export default function DiscoverySearch() {
  const [query, setQuery] = useState("");
  const { albums, images } = useImageGallery({ includePhotos: false, cacheKey: "home-discovery" });

  const items = useMemo<DiscoveryItem[]>(() => {
    const albumItems = albums.map((album) => ({
      id: album.id,
      title: album.name,
      description: album.description,
      href: `/singleAlbum?album=${encodeURIComponent(album.name)}`,
      kind: "album" as const,
    }));

    const photoItems = images.map((image) => ({
      id: image.id,
      title: image.caption ?? image.id,
      description: image.caption,
      href: `/singleAlbum?album=${encodeURIComponent(image.caption ?? albumItems[0]?.title ?? "")}`,
      kind: "photo" as const,
    }));

    return [...albumItems, ...photoItems];
  }, [albums, images]);

  const search = query.trim().toLowerCase();
  const filtered = search
    ? items.filter((item) =>
        includesTerm(item.title, search) ||
        includesTerm(item.description, search)
      )
    : items.slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-10 sm:py-14">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">Discover</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">Search your library</h2>
            <p className="mt-2 text-sm text-white/60">Find albums, captions, and future smart collections without digging through everything.</p>
          </div>
          <label className="w-full sm:max-w-sm">
            <span className="sr-only">Search photos and albums</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search mountains, people, trips..."
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none focus:border-white/30"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.kind + item.id}
              to={item.href}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/5"
            >
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/35">{item.kind}</div>
              <div className="mt-2 text-lg text-white">{item.title}</div>
              <div className="mt-1 text-sm text-white/60 line-clamp-2">{item.description ?? "No description yet"}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
