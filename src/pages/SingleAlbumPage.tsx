import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";
import SingleAlbumImage from "../components/SingleAlbumImage";
import { generateImageCaptionFromFilePath } from "../utils/RetrieveNameFromFilePath";
import Footer from "../components/Footer";

interface ImageInfo {
  url: string;
  id: string;
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  unitWidth: number; // Units of width for the puzzle layout
  unitHeight: number; // Units of height for the puzzle layout
}

const MAX_ROW_UNITS = 4; // Maximum width units for a row

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(globalThis.location.search);
  const albumName = queryParameters.get("album");
  const [images, setImages] = useState<ImageInfo[]>([]); // State to store all images

  useEffect(() => {
    const loadAndProcessImages = async () => {
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
          setImages([]); // Set to empty if album not found
          return;
      }

      const imageUrls = await Promise.all(
        Object.keys(imagesGlob).map(async (key) => {
          const module = await imagesGlob[key]();
          return module.default;
        })
      );

      const imageInfos: ImageInfo[] = await Promise.all(
        imageUrls.map((url) => {
          return new Promise<ImageInfo>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              const orientation = aspectRatio < 1 ? "portrait" : "landscape";

              // Define unit dimensions based on orientation
              const unitWidth = orientation === "portrait" ? 1 : 2;
              const unitHeight = orientation === "portrait" ? 2 : 1;

              resolve({
                url,
                id: generateImageCaptionFromFilePath(url),
                width: img.width,
                height: img.height,
                orientation,
                unitWidth,
                unitHeight,
              });
            };
            img.onerror = () => {
              // Fallback for failed images
              resolve({
                url,
                id: generateImageCaptionFromFilePath(url),
                width: 400,
                height: 300,
                orientation: "landscape",
                unitWidth: 2,
                unitHeight: 1,
              });
            };
            img.src = url;
          });
        })
      );

      // Sort images to potentially help with packing (e.g., put larger items first)
      // This is a simple sort, more complex packing algorithms exist but might be overkill
      imageInfos.sort((a, b) => b.unitWidth - a.unitWidth);

      // We no longer need to arrange into rows in state for the CSS Grid approach
      setImages(imageInfos);
    };

    loadAndProcessImages();
  }, [albumName]);

  return (
    <div className="album-page-container">
      <NavBar />
      <div className="image-gallery-container">
        <h1 className="title-text">{albumName}</h1>
        <div className="puzzle-gallery-container">
          {" "}
          {/* Grid container */}
          {images.map((img) => (
            <SingleAlbumImage
              key={img.id}
              imageSource={img.url}
              imageDescription={generateImageCaptionFromFilePath(img.url)}
              unitWidth={img.unitWidth} // Pass unit dimensions
              unitHeight={img.unitHeight} // Pass unit dimensions
              useUnitSizing={true}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleAlbumPage;
