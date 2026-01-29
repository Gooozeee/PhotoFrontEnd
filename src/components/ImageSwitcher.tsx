import { useState, useEffect } from "react";

interface ImageSwitcherProps {
  images: string[];
}

const ImageSwitcher = ({ images }: ImageSwitcherProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Image ${index + 1}`}
          className={`w-full sm:w-[500px] md:w-[600px] lg:w-[700px] max-w-full h-auto absolute left-1/2 -translate-x-1/2 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />
      ))}
    </div>
  );
};

export default ImageSwitcher;
