import { useEffect, useRef, useState } from "react";
import "../styles/GalleryImageStyles.css";
import { Link } from "react-router-dom";
import ImageModal from "./ImageModal";

interface Props {
  imageSource: string;
  imageDescription: string;
  albumName?: string;
  presetOrientation?: "portrait" | "landscape";
  size?: "normal" | "wide" | "full" | "half" | "third";
}

const SingleAlbumImage = ({
  imageSource,
  imageDescription,
  albumName,
  presetOrientation,
  size,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.remove(
      "portrait",
      "landscape",
      "normal",
      "wide",
      "full"
    );

    if (presetOrientation) {
      container.classList.add(presetOrientation);
    } else {
      const image = new Image();
      image.src = imageSource;

      image.onload = () => {
        const aspectRatio = image.width / image.height;
        if (Math.abs(aspectRatio - 1) <= 0.05) {
          container.classList.add("landscape");
        } else {
          const isPortrait = aspectRatio < 0.95;
          container.classList.add(isPortrait ? "portrait" : "landscape");
        }
      };
    }

    if (size) {
      container.classList.add(size);
    }
  }, [imageSource, presetOrientation, size]);

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
