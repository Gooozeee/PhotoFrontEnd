import { Link } from "react-router-dom";

interface Props {
  imageSource: string;
  imageDescription: string;
}

const GalleryImage = ({ imageSource, imageDescription }: Props) => {
  return (
    <div className="image-item">
      <Link to="/singleAlbum" className="link">
        <img src={imageSource} alt={imageDescription} />
        <div className="overlay">
          <span>{imageDescription}</span>
        </div>
      </Link>
    </div>
  );
};

export default GalleryImage;
