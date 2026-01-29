import { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal = ({ imageUrl, onClose }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
      // Prevent body and html scroll when modal is open
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      // Restore body and html scroll when modal closes
      document.documentElement.style.overflow = "unset";
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-0 m-0 border-none max-w-none max-h-none overflow-hidden ${
        isClosing ? "animate-backdropFadeIn" : "animate-backdropFadeIn"
      }`}
      style={{ 
        animation: isClosing ? "backdropFadeIn 0.4s ease-out reverse" : "backdropFadeIn 0.4s ease-out",
        width: "100vw", 
        height: "100vh" 
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center p-8 overflow-auto touch-pinch-zoom">
        <img
          src={imageUrl}
          alt="Full size view"
          className={`max-w-full max-h-full object-contain select-none ${
            isClosing ? "animate-zoomOut" : imageLoaded ? "animate-zoomIn" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          style={{ touchAction: "pinch-zoom" }}
        />
        <button
          className="absolute top-6 right-6 z-[9999] bg-transparent border-none cursor-pointer text-white hover:text-gray-400 transition-colors duration-200 p-2 rounded hover:bg-white/10"
          onClick={handleClose}
          aria-label="Close image"
        >
          <IoClose size={32} />
        </button>
      </div>
    </dialog>
  );
};

export default ImageModal;
