import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import ImageModal from "./ImageModal";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  imageSource: string;
  imageDescription?: string | null;
  albumName?: string;
  unitWidth: number;
  unitHeight: number;
  useUnitSizing?: boolean;
  imageIndex?: number;
  totalImages?: number;
  onImageClick?: (index: number) => void;
  blurPlaceholder?: string;
}

const SingleAlbumImage = ({
  imageSource,
  imageDescription,
  albumName,
  unitWidth,
  unitHeight,
  useUnitSizing = false,
  imageIndex,
  totalImages,
  onImageClick,
  blurPlaceholder,
}: Props) => {
  const shouldReduceMotion = useReducedMotion();
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const visibleDescription = imageDescription?.trim() ?? "";
  const fallbackDescription = imageIndex !== undefined ? `image ${imageIndex + 1}` : "image";
  const accessibleDescription = visibleDescription || fallbackDescription;

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const containerStyle = !imageLoaded && blurPlaceholder ? {
    background: blurPlaceholder,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  const handleInteraction = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!albumName && !showModal) {
        if (onImageClick && imageIndex !== undefined) {
          onImageClick(imageIndex);
          return;
        }

        setShowModal(true);
      }
    },
    [albumName, showModal, onImageClick, imageIndex]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleInteraction(e);
    }
  };

  const imageClasses = albumName 
    ? "album-cover-img"
    : `w-full h-auto object-cover block transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`;

  const overlayClasses = albumName 
    ? "absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent rounded flex flex-col items-center justify-end pb-6 px-4"
    : `absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded flex flex-col items-center justify-end pb-6 px-4 transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`;

  if (albumName) {
    return (
      <motion.div
        className="relative cursor-pointer overflow-hidden rounded-lg w-full h-full"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      >
        <Link
          to={`/singleAlbum?album=${albumName}`}
          className="block w-full h-full"
        >
          <img
            src={imageSource}
            alt={visibleDescription}
            onLoad={handleImageLoad}
            className={imageClasses}
            loading="lazy"
          />
          <div className={overlayClasses}>
            <span
              className="text-white text-lg font-medium tracking-wide"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
              {albumName}
            </span>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative cursor-pointer overflow-hidden rounded-lg w-full"
      style={containerStyle}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
    >
      <button
        className="relative w-full flex items-center justify-center overflow-hidden rounded-lg cursor-pointer p-0 border-none bg-transparent"
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        aria-label={`View ${accessibleDescription}`}
      >
        <img
          src={imageSource}
          alt={visibleDescription}
          onLoad={handleImageLoad}
          className={imageClasses}
          loading="lazy"
        />
        <div className={overlayClasses}>
          {visibleDescription ? (
            <span
              className="text-white text-sm font-light tracking-wide"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {visibleDescription}
            </span>
          ) : null}
        </div>
      </button>
      {showModal && (
        <ImageModal
          imageUrl={imageSource}
          imageIndex={1}
          totalImages={1}
          onClose={() => setShowModal(false)}
        />
      )}
    </motion.div>
  );
};

export default SingleAlbumImage;
