import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
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
      className="relative cursor-pointer overflow-hidden rounded w-full h-full bg-[rgba(30,30,30,0.5)]"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link
        to={`/singleAlbum?album=${albumName}`}
        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded cursor-pointer transition-transform duration-200 ease-out"
      >
        <img
          src={imageSource}
          alt={imageDescription}
          className={`w-full h-full object-cover object-center block rounded transition-opacity duration-500 ease-bounce ${
            isLoaded ? "opacity-100 blur-none" : "opacity-0 blur-[10px]"
          }`}
          style={{
            animation: `fadeInImage 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
          }}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        <div
          className={`absolute inset-0 bg-[rgba(57,57,57,0.85)] rounded flex items-center justify-center text-center px-5 transition-transform duration-200 ease-bounce ${
            isLoaded ? "scale-0" : "scale-100"
          }`}
        >
          <span className="text-white text-base sm:text-lg md:text-xl font-light">
            {imageDescription}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default GalleryImage;
