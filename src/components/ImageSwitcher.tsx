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
  }, []);

  return (
    <div className="image-container">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Image ${index + 1}`}
          className={`image ${index === currentImageIndex ? "visible" : ""}`}
        />
      ))}
    </div>
  );
};

export default ImageSwitcher;
