import NavBar from "../components/NavBar";
import "../styles/SingleAlbumPageStyles.css";
import SingleAlbumImage from "../components/SingleAlbumImage";
import { generateImageCaptionFromFilePath } from "../utils/RetrieveNameFromFilePath";
import Footer from "../components/Footer";
import { useImageGallery } from "../hooks/useImageGallery";

const SingleAlbumPage = () => {
  const queryParameters = new URLSearchParams(globalThis.location.search);
  const albumName = queryParameters.get("album") || "Birds";

  // Use the custom hook for image loading with caching
  const { images } = useImageGallery({
    albumName,
    cacheKey: `album-${albumName}`,
  });

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
