import NavBar from "../components/NavBar";
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
    <div className="bg-black min-h-screen overflow-x-hidden">
      <NavBar />
      <div className="pt-[150px] pb-10 px-5 sm:px-6 md:px-8 max-w-full w-full">
        <h1 className="text-white font-light text-2xl text-center mb-10">
          {albumName}
        </h1>
        <div className="grid grid-cols-4 gap-4 w-full">
          {/* Grid container */}
          {images.map((img) => (
            <div
              key={img.id}
              className={`
                ${
                  img.unitWidth === 2 && img.unitHeight === 1
                    ? "col-span-2 row-span-1 aspect-[2/1]"
                    : img.unitWidth === 1 && img.unitHeight === 2
                    ? "col-span-1 row-span-2 aspect-[1/2]"
                    : "col-span-1 row-span-1 aspect-[1/1]"
                }
              `}
            >
              <SingleAlbumImage
                imageSource={img.url}
                imageDescription={generateImageCaptionFromFilePath(img.url)}
                unitWidth={img.unitWidth}
                unitHeight={img.unitHeight}
                useUnitSizing={true}
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
