import { useState, useRef, useEffect, useCallback } from "react";
import { IoClose, IoChevronBack, IoChevronForward, IoExpand, IoContract } from "react-icons/io5";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

interface Props {
  imageUrl: string;
  imageIndex?: number;
  totalImages?: number;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

const ImageModal = ({
  imageUrl,
  imageIndex = 1,
  totalImages = 1,
  onClose,
  onNext,
  onPrev,
}: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [direction, setDirection] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const prevImageUrl = useRef(imageUrl);

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
      } else if (e.key === "ArrowRight" && onNext) {
        setDirection(1);
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        setDirection(-1);
        onPrev();
      } else if (e.key === " " && onNext) {
        e.preventDefault();
        setDirection(1);
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
    if (prevImageUrl.current !== imageUrl) {
      setDirection(prevImageUrl.current < imageUrl ? 1 : -1);
      prevImageUrl.current = imageUrl;
    }
    setImageLoaded(false);
  }, [imageUrl]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, shouldReduceMotion ? 0 : 350);
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
      className="fixed inset-0 bg-[#09090B]/95 z-50 p-0 m-0 border-none max-w-none max-h-none overflow-hidden"
      style={{
        width: "100vw",
        height: "100vh",
      }}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto touch-pinch-zoom"
        initial={{ opacity: 1 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      >
        <motion.div
          key={imageUrl}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-full max-h-full"
        >
          <motion.img
            src={imageUrl}
            alt="Full size view"
            className={`max-w-full max-h-[80vh] object-contain select-none transition-transform duration-300 ${
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            }`}
            animate={{
              scale: isZoomed ? 1.5 : 1,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={toggleZoom}
            onLoad={handleImageLoad}
            style={{
              touchAction: "pinch-zoom",
              opacity: imageLoaded ? 1 : 0,
            }}
          />
        </motion.div>

        {/* Image counter */}
        {totalImages > 1 && (
          <div
            className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm tracking-wide transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {imageIndex} / {totalImages}
          </div>
        )}

        {/* Close button */}
        <motion.button
          className="absolute top-6 right-6 z-[9999] bg-black/40 backdrop-blur-sm border-none cursor-pointer text-white hover:text-white/70 transition-colors duration-200 p-3 rounded-full hover:bg-white/10"
          onClick={handleClose}
          aria-label="Close image"
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IoClose size={28} />
        </motion.button>

        {/* Navigation arrows */}
        {onNext && onPrev && totalImages > 1 && (
          <>
            <motion.button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[9999] bg-black/40 backdrop-blur-sm border-none cursor-pointer text-white hover:text-white/70 transition-colors duration-200 p-3 rounded-full hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              aria-label="Previous image"
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IoChevronBack size={32} />
            </motion.button>

            <motion.button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[9999] bg-black/40 backdrop-blur-sm border-none cursor-pointer text-white hover:text-white/70 transition-colors duration-200 p-3 rounded-full hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              aria-label="Next image"
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IoChevronForward size={32} />
            </motion.button>
          </>
        )}

        {/* Zoom toggle */}
        <motion.button
          className="absolute bottom-6 right-6 z-[9999] bg-black/40 backdrop-blur-sm border-none cursor-pointer text-white hover:text-white/70 transition-colors duration-200 p-3 rounded-full hover:bg-white/10"
          onClick={toggleZoom}
          aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isZoomed ? <IoContract size={24} /> : <IoExpand size={24} />}
        </motion.button>

        {/* Keyboard hints - hidden on mobile */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-wide flex gap-4 hidden md:flex"
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <span>ESC close</span>
          <span>← → navigate</span>
          <span>space next</span>
        </motion.div>
      </motion.div>
    </dialog>
  );
};

export default ImageModal;