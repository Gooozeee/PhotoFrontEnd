import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ImageModal from "./ImageModal";

interface Props {
  imageSource: string;
  imageDescription: string;
  albumName?: string;
  unitWidth: number;
  unitHeight: number;
  useUnitSizing?: boolean;
}

const SingleAlbumImage = ({
  imageSource,
  imageDescription,
  albumName,
  unitWidth,
  unitHeight,
  useUnitSizing = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (useUnitSizing) {
      const container = containerRef.current;
      if (!container) return;

      // Remove old size/orientation classes
      container.classList.remove(
        "portrait",
        "landscape",
        "normal",
        "wide",
        "full",
        "tall"
      );

      // Add classes based on unit dimensions for styling
      if (unitWidth === 1 && unitHeight === 2) {
        container.classList.add("portrait-unit");
      } else if (unitWidth === 2 && unitHeight === 1) {
        container.classList.add("landscape-unit");
      } else {
        // Default or other sizes if needed
        container.classList.add("normal-unit");
      }
    }
  }, [unitWidth, unitHeight, useUnitSizing]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!albumName && !showModal) {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handleInteraction(e);
    }
  };

  const imageClasses = `w-full h-full object-cover object-center block rounded transition-opacity duration-500 ease-bounce ${
    imageLoaded ? "opacity-100 blur-none" : "opacity-0 blur-[10px]"
  }`;

  const overlayClasses = `absolute inset-0 bg-[rgba(57,57,57,0.85)] rounded flex items-center justify-center text-center px-5 transition-transform duration-200 ease-bounce scale-0 hover:scale-100 focus-visible:scale-100`;

  if (albumName) {
    // For album gallery - use Link wrapper
    return (
      <div
        ref={containerRef}
        className="relative cursor-pointer overflow-hidden rounded w-full h-full bg-[rgba(30,30,30,0.5)]"
      >
        <Link
          to={`/singleAlbum?album=${albumName}`}
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded cursor-pointer transition-transform duration-200 ease-out"
        >
          <img
            src={imageSource}
            alt={imageDescription}
            onLoad={handleImageLoad}
            className={imageClasses}
            loading="lazy"
          />
          <div className={overlayClasses}>
            <span className="text-white text-base sm:text-lg md:text-xl font-light">
              {albumName}
            </span>
          </div>
        </Link>
      </div>
    );
  }

  // For single images in albums - use button
  return (
    <div
      ref={containerRef}
      className="relative cursor-pointer overflow-hidden rounded w-full h-full bg-[rgba(30,30,30,0.5)]"
    >
      <button
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded cursor-pointer transition-transform duration-200 ease-out w-full h-full p-0 border-none bg-transparent hover:scale-105 focus-visible:scale-105"
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        aria-label={`View full size image of ${imageDescription}`}
        disabled={showModal}
      >
        <img
          src={imageSource}
          alt={imageDescription}
          onLoad={handleImageLoad}
          className={imageClasses}
        />
        <div className={overlayClasses}>
          <span className="text-white text-base sm:text-lg md:text-xl font-light">
            {imageDescription}
          </span>
        </div>
      </button>
      {showModal && (
        <ImageModal
          imageUrl={imageSource}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SingleAlbumImage;
