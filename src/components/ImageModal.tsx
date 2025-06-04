import { useState, useRef, useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

const ImageModal = ({ imageUrl, onClose }: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <dialog ref={dialogRef} className="modal-overlay">
      <div className="modal-image-container">
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close image"
        >
          <IoClose size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Full size view"
          className={`modal-image ${imageLoaded ? "loaded" : ""}`}
          onLoad={handleImageLoad}
        />
      </div>
    </dialog>
  );
};

export default ImageModal;
