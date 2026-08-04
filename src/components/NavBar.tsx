import degooseLogoWhite from "../assets/degooseLogoWhite.webp";
import { useEffect, useState, useCallback, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { IoSearch } from "react-icons/io5";
import { createPortal } from "react-dom";
import { usePhotoSearch } from "../hooks/useDiscovery";
import { getPreviewImageUrl } from "../utils/getPreviewImageUrl";
import ImageModal from "./ImageModal";
import { clampCaption } from "./ImageModal";

function NavBar() {
  const shouldReduceMotion = useReducedMotion();
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);
  const { results, loading, error, searched } = usePhotoSearch(searchQuery);
  const selectedSearchPhoto = results.find((photo) => photo.id === selectedSearchId) ?? null;

  useEffect(() => {
    if (!searchOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node) && !searchOverlayRef.current?.contains(event.target as Node)) closeSearch();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchSubmitted(false);
    window.requestAnimationFrame(() => searchTriggerRef.current?.focus());
  }

  const listenScrollEvent = useCallback(() => {
    const isScrolled = window.scrollY > 20;
    setScrolledDown(isScrolled);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame(() => {
          listenScrollEvent();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    listenScrollEvent();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [listenScrollEvent]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchSubmitted(true);
  }

  const navVariants = {
    initial: { y: -100 },
    animate: {
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/software", label: "Work" },
  ];

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className="fixed top-0 w-full z-50 flex flex-col bg-[#09090B]/40 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-500"
    >
      <div className={`flex justify-between items-center px-6 md:px-10 transition-all duration-500 ${
        scrolledDown ? "h-[70px]" : "h-[90px]"
      }`}>
        <Link
          to="/"
          className={`flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-105 active:scale-98 z-10 ${
            scrolledDown ? "w-[120px]" : "w-[160px]"
          }`}
        >
          <img
            src={degooseLogoWhite}
            alt="De Goose Productions Logo"
            className="w-full h-auto"
          />
        </Link>

        <div
          className={`hidden lg:ml-auto lg:flex items-center gap-8 transition-opacity duration-300 ${
            hamburgerOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          <ul className="flex gap-8 list-none m-0 p-0 items-center">
            {menuItems.map((item) => (
              <li key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-[0.05em] uppercase py-2 block transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-white/60 hover:text-white"
                    }`
                  }
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-[60] ml-auto flex items-center gap-1" ref={searchRef}>
          <button ref={searchTriggerRef} type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => { setSearchOpen(true); setSearchSubmitted(true); }} className="cursor-pointer rounded-full p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60">
            <IoSearch size={22} />
          </button>
          <button
            type="button"
            className="block lg:hidden cursor-pointer bg-transparent p-2"
            aria-label="Toggle menu"
            aria-expanded={hamburgerOpen}
            onClick={() => setHamburgerOpen(!hamburgerOpen)}
          >
            <div className="flex w-6 flex-col gap-1.5">
              <span className={`block h-0.5 bg-white transition-all duration-300 ${hamburgerOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all duration-300 ${hamburgerOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all duration-300 ${hamburgerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
          <AnimatePresence>
            {searchOpen && !searchSubmitted ? (
              <motion.form role="search" onSubmit={submitSearch} initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} className="absolute right-0 top-[calc(100%+0.75rem)] flex w-[min(86vw,22rem)] gap-2 rounded-2xl border border-white/15 bg-[#111113]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <input autoFocus type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the collection" aria-label="Global search" className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:bg-white/10" />
                <button type="submit" aria-label="Submit search" className="cursor-pointer rounded-xl bg-white px-3 py-2 text-sm font-medium text-black transition-colors hover:bg-white/85">Go</button>
              </motion.form>
            ) : null}
          </AnimatePresence>
          {searchOpen && searchSubmitted ? createPortal(
              <motion.div ref={searchOverlayRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/75 p-4 pt-24 backdrop-blur-md sm:p-8 sm:pt-32">
                <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-[#0d0d0f]/95 shadow-2xl shadow-black/50">
                  <form role="search" onSubmit={submitSearch} className="flex gap-2 border-b border-white/10 p-4 sm:p-6">
                    <input autoFocus type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the collection" aria-label="Global search results" className="min-w-0 flex-1 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:bg-white/10" />
                    <button type="submit" aria-label="Submit search" className="cursor-pointer rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black">Search</button>
                    <button type="button" aria-label="Close search results" onClick={closeSearch} className="cursor-pointer rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/65 hover:text-white">Close</button>
                  </form>
                  <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                    {loading ? <div role="status" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />)}</div> : error ? <p role="alert" className="py-16 text-center text-sm text-red-300">Search is unavailable right now.</p> : !searched ? <p className="py-16 text-center text-sm text-white/45">Start typing to search the collection.</p> : results.length === 0 ? <p className="py-16 text-center text-sm text-white/55">No images matched “{searchQuery}”.</p> : <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">{results.map((photo) => <article key={photo.id} className="min-w-0"><button type="button" onClick={() => setSelectedSearchId(photo.id)} aria-label={`View ${clampCaption(photo.caption) ?? photo.fileName}`} className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left focus:outline-none focus:ring-2 focus:ring-white/70"><img src={getPreviewImageUrl(photo.thumbnailUrl) ?? photo.thumbnailUrl ?? photo.url} alt={clampCaption(photo.caption) ?? photo.fileName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /></button><p className="mt-2 line-clamp-1 text-sm text-white/85">{clampCaption(photo.caption) ?? photo.fileName}</p><p className="mt-1 line-clamp-1 text-xs uppercase tracking-[0.15em] text-white/35">{photo.albumName ?? "Collection"}</p></article>)}</div>}
                  </div>
                </div>
              </motion.div>,
              document.body
            ) : null}
          {selectedSearchPhoto ? <ImageModal imageUrl={selectedSearchPhoto.url} caption={clampCaption(selectedSearchPhoto.caption)} tags={selectedSearchPhoto.tags} showTags={false} photoId={selectedSearchPhoto.id} onClose={() => setSelectedSearchId(null)} /> : null}
        </div>
      </div>

      <AnimatePresence>
        {hamburgerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#09090B]/60 backdrop-blur-lg border-t border-white/[0.08] overflow-hidden"
          >
            <ul className="flex flex-col py-4 list-none text-center">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="block py-4 text-2xl font-semibold text-white hover:text-white/60 transition-colors duration-200"
                    style={{ fontFamily: "'Archivo', sans-serif" }}
                    onClick={() => setHamburgerOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default NavBar;
