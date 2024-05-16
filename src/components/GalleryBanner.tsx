import "../styles/GalleryBannerStyles.css";
import bird1 from "../assets/Animals/Birds/Bird1.jpg";
import rallySide2 from "../assets/Racing/Rally/Rally-Side-2.jpg";
import GalleryImage from "./GalleryImage";

interface Props {
  title?: string;
}

const GalleryBanner = ({ title }: Props) => {
  return (
    <div className="gallery-banner-container">
      <h1 className="title-text">{title}</h1>
      <h2 className="title-text subheading">Choose a photo below to see similar images</h2>
      <div className="image-gallery">
        <div className="column">
          <GalleryImage
            imageSource={bird1}
            imageDescription="Birds in Flight"
          />
        </div>
        <div className="column">
          <GalleryImage
            imageSource={rallySide2}
            imageDescription="Kirkistown Rally 2022" />
        </div>
      </div>
    </div>
  );
};

export default GalleryBanner;
