import "../styles/GalleryBannerStyles.css";
import bird1 from "../assets/Animals/Birds/Bird1.jpg";
import bird3 from "../assets/Animals/Birds/Bird3.jpg";
import bird4 from "../assets/Animals/Birds/Bird4.jpg";
import bird5 from "../assets/Animals/Birds/Bird5.jpg";

interface Props {
    title: string;
};

const GalleryBanner = ({title}: Props) => {
  return (
    <div className="gallery-banner-container">
      <h1 className="title-text">{title}</h1>
      <div className="image-scroll-container">
        <img src={bird1} alt="Image 1"/>
        <img src={bird3} alt="Image 3"/>
        <img src={bird4} alt="Image 1"/>
        <img src={bird5} alt="Image 2"/>
      </div>
      <h4>Some explanation about the images blah blah</h4>
    </div>
  );
};

export default GalleryBanner;
