import { Link } from "react-router-dom";
import "../styles/GalleryImageStyles.css";

interface Props {
  imageSource: string;
  imageDescription: string;
  albumName: string;
}

const GalleryImage = ({ imageSource, imageDescription, albumName }: Props) => {
  return (
    <div className="image-item">
      <Link to={`/singleAlbum?album=${albumName}`} className="link">
        <img src={imageSource} alt={imageDescription} />
        <div className="overlay">
          <span>{imageDescription}</span>
        </div>
      </Link>
    </div>
  );
};

export default GalleryImage;
