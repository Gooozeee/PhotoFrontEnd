import { useState, useCallback } from "react";
import SingleAlbumImage from "../components/SingleAlbumImage";
import ImageModal from "../components/ImageModal";
import { generateImageCaptionFromFilePath } from "../utils/RetrieveNameFromFilePath";
import Footer from "../components/Footer";
import { useImageGallery } from "../hooks/useImageGallery";
import { motion } from "framer-motion";
import { getAlbumGridLayout } from "../utils/getAlbumGridLayout";

interface GalleryImage {
  id: string;
  url: string;
  blurPlaceholder?: string;
  unitWidth: number;
  unitHeight: number;
}

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(globalThis.location.search);
  const albumName = queryParameters.get("album") || "Birds";

  const { images } = useImageGallery({
    albumName,
    cacheKey: `album-${albumName}`,
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const { gridClassName, maxWidthClassName } = getAlbumGridLayout(images.length);

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev < images.length - 1 ? prev + 1 : 0;
    });
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : images.length - 1;
    });
  }, [images.length]);

  const renderGallery = () => (
    <div className={`${gridClassName} gap-2 w-full ${maxWidthClassName} mx-auto`}>
      {images.map((img, index) => (
        <motion.div
          key={img.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.03 }}
          className="break-inside-avoid mb-2 inline-block w-full"
        >
          <SingleAlbumImage
            imageSource={img.url}
            imageDescription={img.caption || generateImageCaptionFromFilePath(img.url)}
            unitWidth={img.unitWidth}
            unitHeight={img.unitHeight}
            useUnitSizing={false}
            imageIndex={index}
            totalImages={images.length}
            onImageClick={handleImageClick}
            blurPlaceholder={img.blurPlaceholder}
          />
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="bg-[#09090B] min-h-screen overflow-x-hidden">
      <div className="pt-[150px] pb-10 px-5 sm:px-6 md:px-8 max-w-full w-full mx-auto">
        <motion.h1
          className="text-white font-light text-[clamp(1.5rem,4vw,2.5rem)] text-center mb-3 tracking-tight"
          style={{ fontFamily: "'Archivo', sans-serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {albumName}
        </motion.h1>
        <motion.p
          className="text-white/50 text-center mb-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {images.length} photos
        </motion.p>

        {renderGallery()}
      </div>
      <Footer />

      {selectedImageIndex !== null && (
        <ImageModal
          imageUrl={images[selectedImageIndex].url}
          imageIndex={selectedImageIndex + 1}
          totalImages={images.length}
          onClose={handleCloseModal}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default SingleAlbumPage;
