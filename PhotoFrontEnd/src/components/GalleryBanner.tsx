import "../styles/GalleryBannerStyles.css";
import bird1 from "../assets/Animals/Birds/Bird1.jpg";
import bird2 from "../assets/Animals/Birds/Bird2.jpg";
import bird3 from "../assets/Animals/Birds/Bird3.jpg";
import bird4 from "../assets/Animals/Birds/Bird4.jpg";
import bird5 from "../assets/Animals/Birds/Bird5.jpg";

interface Props {
  title: string;
}

const GalleryBanner = ({ title }: Props) => {
  return (
    <div className="gallery-banner-container">
      <h1 className="title-text">{title}</h1>
      <div className="image-gallery">
        <div className="column">
          <div className="image-item">
            <img src={bird1} alt="Bird 1" />
            <div className="overlay">
              <span>Bird 1</span>
            </div>
          </div>
          <div className="image-item">
            <img src={bird3} alt="Bird 3" />
            <div className="overlay">
              <span>Bird 3</span>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="image-item">
            <img src={bird4} alt="Bird 4" />
            <div className="overlay">
              <span>Bird 4</span>
            </div>
          </div>
          <div className="image-item">
            <img src={bird5} alt="Bird 5" />
            <div className="overlay">
              <span>Bird 5</span>
            </div>
          </div>
          </div>
        </div>
      </div>
  );
};

export default GalleryBanner;
