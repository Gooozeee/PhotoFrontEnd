import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";
import SingleAlbumImage from "../components/SingleAlbumImage";
import { generateImageCaptionFromFilePath } from "../utils/RetrieveNameFromFilePath";
import Footer from "../components/Footer";
import { splitArray } from "../utils/SplitArrayIntoParts";

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const albumName = queryParameters.get("album");

  const [imagesForFirstColumn, setImagesForFirstColumn] = useState<string[]>(
    []
  );
  const [imagesForSecondColumn, setImagesForSecondColum] = useState<string[]>(
    []
  );
  const [imagesForThirdColumn, setImagesForThirdColumn] = useState<string[]>(
    []
  );

  useEffect(() => {
    const loadImages = async () => {
      let imagesGlob: Record<string, () => Promise<{ default: string }>>;

      // Have to use switch case as import.meta.glob does not accept dynamic parameters
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

      const imageUrls = await Promise.all(
        Object.keys(imagesGlob).map(async (key) => {
          const module = await imagesGlob[key]();
          return module.default;
        })
      );

      var imagesForColumns: string[][] = splitArray(imageUrls, 3);

      setImagesForFirstColumn(imagesForColumns[0]);
      setImagesForSecondColum(imagesForColumns[1]);
      setImagesForThirdColumn(imagesForColumns[2]);
    };

    loadImages();
  }, [albumName]);

  return (
    <div className="album-page-container">
      <NavBar />
      <div className="image-gallery-container">
        <h1 className="title-text">{albumName}</h1>
        <div className="image-gallery">
          <div className="column">
            {imagesForFirstColumn.map((src, index) => (
              <SingleAlbumImage
                key={index}
                imageSource={src}
                imageDescription={generateImageCaptionFromFilePath(src)}
              />
            ))}
          </div>
          <div className="column">
            {imagesForSecondColumn.map((src, index) => (
              <SingleAlbumImage
                key={index}
                imageSource={src}
                imageDescription={generateImageCaptionFromFilePath(src)}
              />
            ))}
          </div>
          <div className="column">
            {imagesForThirdColumn.map((src, index) => (
              <SingleAlbumImage
                key={index}
                imageSource={src}
                imageDescription={generateImageCaptionFromFilePath(src)}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SingleAlbumPage;
