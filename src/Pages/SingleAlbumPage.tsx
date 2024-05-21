import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";
import SingleAlbumImage from "../components/SingleAlbumImage";

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const albumName = queryParameters.get("album");

  const [images, setImages] = useState<string[]>([]);

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
        default:
          console.log("Not found folder");
          return;
      }

      const imageUrls = await Promise.all(
        Object.keys(imagesGlob).map(async (key) => {
          const module = await imagesGlob[key]();
          return module.default;
        })
      );

      setImages(imageUrls);
    };

    loadImages();
  }, [albumName]);

  return (
    <div className="album-page-container">
      <NavBar />

      <div className="image-gallery">
        <div className="column">
          {images.map((src, index) =>
            index % 2 === 1 ? (
              <SingleAlbumImage
                key={index}
                imageSource={src}
                imageDescription={`Image ${index}`}
              />
            ) : null
          )}
        </div>
        <div className="column">
          {images.map((src, index) =>
            index % 2 === 0 ? (
              <SingleAlbumImage
                key={index}
                imageSource={src}
                imageDescription={`Image ${index}`}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleAlbumPage;
