import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";
import SingleAlbumImage from "../components/SingleAlbumImage";
import { generateImageCaptionFromFilePath } from "../utils/RetrieveNameFromFilePath";
import Footer from "../components/Footer";

interface ImageInfo {
  url: string;
  isPortrait: boolean;
  id: string;
  size?: "normal" | "wide" | "full";
}

const determineImageOrientation = async (url: string): Promise<ImageInfo> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        url,
        isPortrait: img.height > img.width,
        id: generateImageCaptionFromFilePath(url),
      });
    };
    img.src = url;
  });
};

const optimizeImageLayout = (images: ImageInfo[]): ImageInfo[] => {
  let optimizedImages = [...images];
  const totalImages = images.length;

  if (totalImages < 4) return optimizedImages;

  const remainingImages = totalImages % 4;
  if (remainingImages === 0) return optimizedImages;

  // If we have remaining images, adjust the layout of the last few images
  const startIndex = totalImages - remainingImages - 2;
  if (remainingImages === 2) {
    // For 2 remaining images, make the last 4 images equal width
    for (let i = startIndex; i < totalImages; i++) {
      optimizedImages[i].size = "normal";
    }
  } else if (remainingImages === 1) {
    // For 1 remaining image, make it full width
    optimizedImages[totalImages - 1].size = "full";
  } else if (remainingImages === 3) {
    // For 3 remaining images, make last 3 equal width
    for (let i = totalImages - 3; i < totalImages; i++) {
      optimizedImages[i].size = "wide";
    }
  }

  return optimizedImages;
};

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const albumName = queryParameters.get("album");
  const [images, setImages] = useState<ImageInfo[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      let imagesGlob: Record<string, () => Promise<{ default: string }>>;

      switch (albumName) {
        case "Birds":
          imagesGlob = import.meta.glob("../assets/Birds/*") as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        case "Rally":
          imagesGlob = import.meta.glob("../assets/Rally/*") as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        case "Cities":
          imagesGlob = import.meta.glob("../assets/Cities/*") as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        case "Landscapes":
          imagesGlob = import.meta.glob("../assets/Landscapes/*") as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        default:
          console.log("Not found folder");
          return;
      }

      const imagePromises = Object.keys(imagesGlob).map(async (key) => {
        const module = await imagesGlob[key]();
        return module.default;
      });

      const imageUrls = await Promise.all(imagePromises);
      const imageInfos = await Promise.all(
        imageUrls.map(determineImageOrientation)
      );

      const optimizedImages = optimizeImageLayout(imageInfos);
      setImages(optimizedImages);
    };

    loadImages();
  }, [albumName]);

  return (
    <div className="album-page-container">
      <NavBar />
      <div className="image-gallery-container">
        <h1 className="title-text">{albumName}</h1>
        <div className="masonry-grid">
          {images.map((img) => (
            <SingleAlbumImage
              key={img.id}
              imageSource={img.url}
              imageDescription={generateImageCaptionFromFilePath(img.url)}
              presetOrientation={img.isPortrait ? "portrait" : "landscape"}
              size={img.size}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleAlbumPage;
