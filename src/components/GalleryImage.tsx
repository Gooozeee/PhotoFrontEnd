import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/GalleryImageStyles.css";
import { motion } from "framer-motion";

interface Props {
  imageSource: string;
  imageDescription: string;
  albumName: string;
}

const GalleryImage = ({ imageSource, imageDescription, albumName }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      className="image-item"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link to={`/singleAlbum?album=${albumName}`} className="image-wrapper">
        <img
          src={imageSource}
          alt={imageDescription}
          className={isLoaded ? "loaded" : ""}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        <div className="overlay">
          <span>{imageDescription}</span>
        </div>
      </Link>
    </motion.div>
  );
};

export default GalleryImage;
