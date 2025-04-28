import "../styles/GalleryBannerStyles.css";
import bird1 from "../assets/Birds/Seagull Northern Ireland 2022.webp";
import rallySide2 from "../assets/Rally/Yellow Escort Pan Kirkistown 2023.webp";
import aachen from "../assets/Cities/Aachen Germany 2022.webp";
import koTao from "../assets/Landscapes/Koh Tao 2023.webp";
import SingleAlbumImage from "./SingleAlbumImage";

interface Props {
  title?: string;
}

const GalleryBanner = ({ title }: Props) => {
  return (
    <div className="gallery-banner-container">
      <h1 className="title-text">{title}</h1>
      <h2 className="subheading">Choose a photo below to see the album</h2>
      <div className="masonry-grid">
        <SingleAlbumImage
          imageSource={koTao}
          imageDescription="Landscapes"
          albumName="Landscapes"
          size="normal"
          presetOrientation="landscape"
        />
        <SingleAlbumImage
          imageSource={aachen}
          imageDescription="Cities Around the World"
          albumName="Cities"
          size="normal"
          presetOrientation="landscape"
        />
        <SingleAlbumImage
          imageSource={rallySide2}
          imageDescription="Kirkistown Rally"
          albumName="Rally"
          size="normal"
          presetOrientation="landscape"
        />
        <SingleAlbumImage
          imageSource={bird1}
          imageDescription="Birds"
          albumName="Birds"
          size="normal"
          presetOrientation="landscape"
        />
      </div>
    </div>
  );
};

export default GalleryBanner;
