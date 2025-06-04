import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";
import SingleAlbumImage from "../components/SingleAlbumImage";
import { generateImageCaptionFromFilePath } from "../utils/RetrieveNameFromFilePath";
import Footer from "../components/Footer";

interface ImageInfo {
  url: string;
  id: string;
}

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
      const imageInfos: ImageInfo[] = imageUrls.map(url => ({
        url,
        id: generateImageCaptionFromFilePath(url),
      }));

      setImages(imageInfos);
    };

    loadImages();
  }, [albumName]);

  return (
    <div className="album-page-container">
      <NavBar />
      <div className="image-gallery-container">
        <h1 className="title-text">{albumName}</h1>
        <div className="flex-gallery-grid">
          {images.map((img) => (
            <div className="image-item">
              <SingleAlbumImage
                key={img.id}
                imageSource={img.url}
                imageDescription={generateImageCaptionFromFilePath(img.url)}
              />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleAlbumPage;
