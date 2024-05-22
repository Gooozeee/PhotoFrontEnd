import "../styles/GalleryBannerStyles.css";
import bird1 from "../assets/Birds/Seagull, Northern Ireland, 2022.webp";
import rallySide2 from "../assets/Rally/Yellow Escort Pan, Kirkistown, 2023.webp";
import GalleryImage from "./GalleryImage";

interface Props {
  title?: string;
}

const GalleryBanner = ({ title }: Props) => {
  return (
    <div className="gallery-banner-container">
      <h1 className="title-text">{title}</h1>
      <h2 className="title-text subheading">
        Choose a photo below to see similar images
      </h2>
      <div className="image-gallery">
        <div className="column">
          <GalleryImage
            imageSource={bird1}
            imageDescription="Birds in Flight"
            albumName="Birds"
          />
        </div>
        <div className="column">
          <GalleryImage
            imageSource={rallySide2}
            imageDescription="Kirkistown Rally 2022"
            albumName="Rally"
          />
        </div>
      </div>
    </div>
  );
};

export default GalleryBanner;
