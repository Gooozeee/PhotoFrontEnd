import { useState, useCallback, useEffect, useRef } from "react";
import SingleAlbumImage from "../components/SingleAlbumImage";
import ImageModal from "../components/ImageModal";
import Footer from "../components/Footer";
import { useImageGallery } from "../hooks/useImageGallery";
import { motion } from "framer-motion";
import { getAlbumGridLayout } from "../utils/getAlbumGridLayout";

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(globalThis.location.search);
  const albumName = queryParameters.get("album")?.trim() ?? "";
  const missingAlbumName = albumName.length === 0;

  const { images, loading, loadingMore, error, hasMore, totalCount, loadMore } = useImageGallery({
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

  const renderGallery = () => (
    <div className={`${gridClassName} gap-2 w-full ${maxWidthClassName} mx-auto`}>
      {images.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.03 }}
          className="break-inside-avoid mb-2 inline-block w-full"
        >
          <SingleAlbumImage
            imageSource={img.url}
            imageDescription={img.caption}
            unitWidth={img.unitWidth}
            unitHeight={img.unitHeight}
            useUnitSizing={false}
            imageIndex={index}
            totalImages={images.length}
            onImageClick={handleImageClick}
            blurPlaceholder={img.blurPlaceholder}
          />
        </motion.div>
      ))}
      {hasMore ? <div ref={loadMoreRef} className="h-12 w-full" /> : null}
    </div>
  );

  return (
    <div className="bg-[#09090B] min-h-screen overflow-x-hidden">
      <div className="pt-[150px] pb-10 px-5 sm:px-6 md:px-8 max-w-full w-full mx-auto">
        <motion.h1
          className="text-white font-light text-[clamp(1.5rem,4vw,2.5rem)] text-center mb-3 tracking-tight"
          style={{ fontFamily: "'Archivo', sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {albumName || "Album"}
        </motion.h1>
        <motion.p
          className="text-white/50 text-center mb-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {statusText}
        </motion.p>

        {isAlbumSelectionError && images.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white">
            <p className="text-lg font-medium">Album not found</p>
            <p className="mt-3 text-sm text-white/70">{albumSelectionError}</p>
          </div>
        ) : loading && images.length === 0 ? (
          <div role="status" className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-white shadow-2xl shadow-black/20">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Waking up</p>
            <p className="mt-4 text-[clamp(1.25rem,3vw,1.75rem)] font-medium">Waiting for the images to wake up...</p>
            <p className="mt-3 text-sm text-white/60">The image service can take a moment to come back after sitting idle.</p>
          </div>
        ) : error && images.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-10 text-center text-red-100">
            <p className="text-lg font-medium">Gallery unavailable right now</p>
            <p className="mt-3 text-sm text-red-100/80">Waiting for the images to wake up...</p>
          </div>
        ) : (
          <>
            {renderGallery()}
            {hasMore ? <p className="mt-6 text-center text-sm text-white/45">Showing {images.length} of {totalCount} photos. More load as you scroll.</p> : null}
            {loadingMore ? <p className="mt-4 text-center text-sm text-white/45">Loading more photos...</p> : null}
          </>
        )}
      </div>
      <Footer />

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          imageIndex={selectedImageIndex + 1}
          totalImages={images.length}
          onClose={handleCloseModal}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default SingleAlbumPage;
