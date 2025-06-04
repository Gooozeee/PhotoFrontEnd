import { useEffect, useRef } from "react";
import "../styles/GalleryImageStyles.css";
import { Link } from "react-router-dom";

interface Props {
  imageSource: string;
  imageDescription: string;
  albumName?: string;
  presetOrientation?: "portrait" | "landscape";
  size?: "normal" | "wide" | "full";
}

const SingleAlbumImage = ({
  imageSource,
  imageDescription,
  albumName,
  presetOrientation,
  size,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
        // Handle square or near-square images (tolerance of 5%)
        if (Math.abs(aspectRatio - 1) <= 0.05) {
          container.classList.add("landscape"); // Treat squares as landscape
        } else {
          // For non-square images, use stricter ratio checks
          const isPortrait = aspectRatio < 0.95;
          container.classList.add(isPortrait ? "portrait" : "landscape");
        }
      };
    }

    if (size) {
      container.classList.add(size);
    }
  }, [imageSource, presetOrientation, size]);

  const content = (
    <div className="image-wrapper">
      <img src={imageSource} alt={imageDescription} />
      <div className="overlay">
        <span>{imageDescription}</span>
      </div>
    </div>
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
