import { useState, useEffect } from "react";

interface ImageSwitcherProps {
  images: string[];
}

const ImageSwitcher = ({ images }: ImageSwitcherProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative flex items-center justify-center w-full aspect-video">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Image ${index + 1}`}
          className={`w-full h-full object-contain absolute left-0 top-0 transition-opacity duration-1000 ease-in-out rounded-lg ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
};

export default ImageSwitcher;
