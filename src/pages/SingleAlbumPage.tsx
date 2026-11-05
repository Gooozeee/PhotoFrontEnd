import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import SingleAlbumImage from "../components/SingleAlbumImage";
import ImageModal from "../components/ImageModal";
import Footer from "../components/Footer";
import { useImageGallery } from "../hooks/useImageGallery";
import { getAlbumGridLayout } from "../utils/getAlbumGridLayout";

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(globalThis.location.search);
  const albumName = queryParameters.get("album")?.trim() ?? "";
  const missingAlbumName = albumName.length === 0;

  const {
    albums = [],
    images,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
  } = useImageGallery({
    albumName: albumName || undefined,
    cacheKey: `album-${albumName || "unknown"}`,
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const albumSelectionError = missingAlbumName ? "Album link is missing or invalid." : error;
  const isAlbumSelectionError = missingAlbumName || Boolean(error?.startsWith("Album"));
  const statusText = loading
    ? "Loading album photos..."
    : isAlbumSelectionError
      ? "Invalid album link"
      : error
        ? "Gallery unavailable right now"
        : `${totalCount || images.length} photos`;

  const album = albums.find((item) => item.name.toLowerCase() === albumName.toLowerCase()) ?? null;
  const cover = album?.coverUrl ?? images[0]?.url ?? null;
  const { gridClassName, maxWidthClassName } = getAlbumGridLayout(images.length);
  const selectedImage = selectedImageIndex === null ? null : images[selectedImageIndex] ?? null;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        void loadMore();
      }
    }, { rootMargin: "300px 0px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loadMore, loadingMore]);

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev < images.length - 1 ? prev + 1 : 0;
    });
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : images.length - 1;
    });
  }, [images.length]);

  const renderLoadingGrid = () => (
    <div className={`${gridClassName} ${maxWidthClassName} mx-auto w-full`} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="mb-6 break-inside-avoid bg-white p-2 shadow-[0_14px_40px_rgba(18,14,8,0.1)]">
          <div className="aspect-[4/3] animate-pulse bg-black/5" />
        </div>
      ))}
    </div>
  );

  const renderGallery = () => (
    <div className={`${gridClassName} ${maxWidthClassName} mx-auto w-full`}>
      {images.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: Math.min(index * 0.015, 0.18) }}
          className="mb-6 break-inside-avoid"
        >
          <SingleAlbumImage
            imageSource={img.url}
            imageDescription={img.caption ?? "Untitled"}
            imageTags={img.tags}
            unitWidth={img.unitWidth}
            unitHeight={img.unitHeight}
            useUnitSizing={false}
            imageIndex={index}
            totalImages={images.length}
            onImageClick={handleImageClick}
            blurPlaceholder={img.blurPlaceholder}
            variant="print"
          />
        </motion.div>
      ))}
      {hasMore ? <div ref={loadMoreRef} className="h-12 w-full" /> : null}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0B0B0C] text-[#E9E2D6]">
      <section className="relative min-h-[72vh] overflow-hidden">
        {cover ? (
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" decoding="async" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1a1815_0%,#0B0B0C_70%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/45 to-transparent" />
        <div className="relative flex min-h-[72vh] flex-col justify-end px-5 pb-10 pt-32 md:px-10 md:pb-14">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-4 text-xs text-white/45">
            <a href="/" className="transition-colors hover:text-white">← All albums</a>
            <span className="tabular-nums">{statusText}</span>
          </div>
          <motion.h1
            className="mt-10 font-display text-[clamp(3rem,9vw,8rem)] leading-[0.85] tracking-[-0.05em] text-white"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {albumName || "Album"}
          </motion.h1>
          {album?.description ? (
            <motion.p
              className="mt-4 max-w-xl text-sm leading-6 text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {album.description}
            </motion.p>
          ) : null}
        </div>
      </section>

      <section className="bg-[#E9E2D6] px-5 py-16 text-[#0B0B0C] md:px-10 md:py-24">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-8 flex items-end justify-between gap-6 border-b border-black/10 pb-4">
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] leading-none tracking-[-0.04em]">The prints</h2>
            <p className="text-xs tabular-nums text-black/45">{loading ? "Loading" : `${images.length} photographs`}</p>
          </div>

          {isAlbumSelectionError && images.length === 0 ? (
            <div className="max-w-3xl border-t border-black/15 py-10">
              <p className="font-display text-3xl">Album not found</p>
              <p className="mt-3 text-sm text-black/60">{albumSelectionError}</p>
            </div>
          ) : loading && images.length === 0 ? (
            <div className="space-y-6">
              <div role="status" className="max-w-3xl py-10">
                <p className="text-xs uppercase tracking-[0.3em] text-black/40">Waking up</p>
                <p className="mt-4 font-display text-[clamp(1.5rem,3vw,2.2rem)]">Waiting for the images to wake up...</p>
                <p className="mt-3 text-sm text-black/55">The image service can take a moment to come back after sitting idle.</p>
              </div>
              {renderLoadingGrid()}
            </div>
          ) : error && images.length === 0 ? (
            <div className="max-w-3xl border-t border-black/15 py-10">
              <p className="font-display text-3xl">Gallery unavailable right now</p>
              <p className="mt-3 text-sm text-black/60">Waiting for the images to wake up...</p>
            </div>
          ) : (
            <>
              {renderGallery()}
              {loadingMore ? renderLoadingGrid() : null}
              {hasMore ? <p className="mt-6 text-sm text-black/50">Showing {images.length} of {totalCount} photos. More load as you scroll.</p> : null}
              {loadingMore ? <p className="mt-4 text-sm text-black/50">Loading more photos...</p> : null}
            </>
          )}
        </div>
      </section>

      <Footer />

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          imageIndex={selectedImageIndex + 1}
          totalImages={images.length}
          caption={selectedImage.caption}
          tags={selectedImage.tags}
          onClose={handleCloseModal}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default SingleAlbumPage;
