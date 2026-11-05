import { useState, useRef, useEffect, useCallback } from "react";
import { IoChevronBack, IoChevronForward, IoExpand, IoContract } from "react-icons/io5";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import SimilarPhotosRow from "./SimilarPhotosRow";
import type { DiscoveryPhoto } from "../lib/discoveryApi";

const MAX_CAPTION_CHARS = 80;

export function clampCaption(caption: string | null | undefined, maxChars = MAX_CAPTION_CHARS): string | null {
  if (!caption) return null;
  const trimmed = caption.trim();
  if (!trimmed) return null;
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}…`;
}

interface Props {
  imageUrl: string;
  imageIndex?: number;
  totalImages?: number;
  caption?: string | null;
  tags?: string[];
  showTags?: boolean;
  photoId?: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const ImageModal = ({
  imageUrl,
  imageIndex = 1,
  totalImages = 1,
  caption,
  tags = [],
  showTags = false,
  photoId,
  onClose,
  onNext,
  onPrev,
}: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [similarPhoto, setSimilarPhoto] = useState<DiscoveryPhoto | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const similarPhotoRef = useRef<DiscoveryPhoto | null>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const currentImageUrl = similarPhoto?.url ?? imageUrl;
  const currentCaption = similarPhoto ? similarPhoto.caption : caption;
  const currentTags = showTags ? (similarPhoto ? similarPhoto.tags : tags) : [];
  const currentAlt = similarPhoto ? (similarPhoto.caption ?? similarPhoto.fileName) : (caption ?? "Full size view");

  useEffect(() => {
    similarPhotoRef.current = similarPhoto;
  }, [similarPhoto]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    hideControlsTimer.current = setTimeout(() => {
      if (!isZoomed) setShowControls(false);
    }, 3000);
  }, [isZoomed]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (!similarPhotoRef.current && e.key === "ArrowRight" && onNext) {
        onNext();
      } else if (!similarPhotoRef.current && e.key === "ArrowLeft" && onPrev) {
        onPrev();
      } else if (!similarPhotoRef.current && e.key === " " && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      document.documentElement.style.overflow = "unset";
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    setSimilarPhoto(null);
  }, [imageUrl, photoId]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentImageUrl]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, shouldReduceMotion ? 0 : 550);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setShowControls(true);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Image viewer"
      className="fixed inset-0 z-50 m-0 max-h-none max-w-none overflow-hidden border-none bg-transparent p-0 [&::backdrop]:bg-black/70"
      style={{
        width: "100vw",
        height: "100vh",
      }}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="relative flex h-full w-full flex-col overflow-hidden bg-[#0B0B0C]"
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={{
          clipPath: isClosing ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)",
          opacity: isClosing ? 0 : 1,
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(233,226,214,0.06),transparent_62%)]" />

        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 pb-2 pt-20 sm:px-8">
          <motion.div
            key={currentImageUrl}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: imageLoaded ? 1 : 0, scale: isZoomed ? 1.15 : 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full items-center justify-center"
          >
            <img
              src={currentImageUrl}
              alt={currentAlt}
              className={`max-h-full max-w-full object-contain select-none transition-transform duration-300 ${
                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              onClick={toggleZoom}
              onLoad={handleImageLoad}
              style={{
                touchAction: "pinch-zoom",
                opacity: imageLoaded ? 1 : 0,
              }}
            />
          </motion.div>
        </div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/70 to-transparent px-5 pb-8 pt-5 md:px-10 md:pt-8"
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
        >
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">
            {!similarPhoto && totalImages > 1 ? (
              <span className="tabular-nums">{String(imageIndex).padStart(2, "0")} / {String(totalImages).padStart(2, "0")}</span>
            ) : (
              <span>Photograph</span>
            )}
          </div>
          <motion.button
            className="pointer-events-auto min-h-11 cursor-pointer border-b border-white/20 pb-1 text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:border-white/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onClick={handleClose}
            aria-label="Close image"
            tabIndex={showControls ? 0 : -1}
          >
            Close
          </motion.button>
        </motion.div>

        {!similarPhoto && onNext && onPrev && totalImages > 1 ? (
          <>
            <motion.button
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-5 text-white/35 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-2 sm:p-7"
              onClick={(event) => {
                event.stopPropagation();
                onPrev();
              }}
              aria-label="Previous image"
              tabIndex={showControls ? 0 : -1}
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IoChevronBack size={30} />
            </motion.button>

            <motion.button
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-5 text-white/35 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-2 sm:p-7"
              onClick={(event) => {
                event.stopPropagation();
                onNext();
              }}
              aria-label="Next image"
              tabIndex={showControls ? 0 : -1}
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IoChevronForward size={30} />
            </motion.button>
          </>
        ) : null}

        <div
          className="pointer-events-none relative z-10 shrink-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/95 to-transparent px-5 pb-6 pt-4 md:px-10 md:pb-8"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {photoId ? (
            <div className="pointer-events-auto mx-auto max-w-[1500px]">
              <SimilarPhotosRow
                photoId={photoId}
                selectedId={similarPhoto?.id ?? null}
                onSelectPhoto={setSimilarPhoto}
                onReset={similarPhoto ? () => setSimilarPhoto(null) : undefined}
              />
            </div>
          ) : null}

          <motion.div
            className="mx-auto mt-4 flex max-w-[1500px] items-end justify-between gap-6"
            animate={{ opacity: showControls ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-xl">
              {currentCaption ? (
                <p className="line-clamp-2 font-display text-[clamp(1.35rem,2.5vw,2.1rem)] leading-[1.02] tracking-[-0.02em] text-[#E9E2D6]">
                  {clampCaption(currentCaption)}
                </p>
              ) : null}
              {currentTags.length > 0 ? (
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {currentTags.join(" · ")}
                </p>
              ) : null}
            </div>
            <div className={`flex shrink-0 items-center gap-4 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/35 ${showControls ? "pointer-events-auto" : "pointer-events-none"}`}>
              <button
                type="button"
                className="cursor-pointer transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={toggleZoom}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                tabIndex={showControls ? 0 : -1}
              >
                {isZoomed ? <IoContract size={18} /> : <IoExpand size={18} />}
              </button>
              <span className="hidden md:inline">Esc to close</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </dialog>
  );
};

export default ImageModal;
