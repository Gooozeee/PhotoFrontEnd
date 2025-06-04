import { useEffect, useRef, useState } from "react";
import "../styles/GalleryImageStyles.css";
import { Link } from "react-router-dom";
import ImageModal from "./ImageModal";

interface Props {
  imageSource: string;
  imageDescription: string;
  albumName?: string;
  unitWidth: number; // Added unitWidth prop
  unitHeight: number; // Added unitHeight prop
}

const SingleAlbumImage = ({
  imageSource,
  imageDescription,
  albumName,
  unitWidth, // Destructure unitWidth
  unitHeight, // Destructure unitHeight
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
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

    // Add classes based on unit dimensions for CSS styling
    if (unitWidth === 1 && unitHeight === 2) {
      container.classList.add("portrait-unit");
    } else if (unitWidth === 2 && unitHeight === 1) {
      container.classList.add("landscape-unit");
    } else {
      // Default or other sizes if needed
      container.classList.add("normal-unit");
    }

    // Removed the image loading logic and calculatedSize logic
  }, [unitWidth, unitHeight]); // Dependencies on unit dimensions

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

  const content = (
    <>
      <button
        className="image-wrapper"
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        aria-label={`View full size image of ${imageDescription}`}
        disabled={showModal}
      >
        <img
          src={imageSource}
          alt={imageDescription}
          onLoad={handleImageLoad}
          className={imageLoaded ? "loaded" : ""}
        />
        <div className="overlay">
          <span>{imageDescription}</span>
        </div>
      </button>
      {showModal && (
        <ImageModal
          imageUrl={imageSource}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );

  return (
    <div ref={containerRef} className="image-item">
      {albumName ? (
        <Link to={`/singleAlbum?album=${albumName}`} className="link">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

export default SingleAlbumImage;
