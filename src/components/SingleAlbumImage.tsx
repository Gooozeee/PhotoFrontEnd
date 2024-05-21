import "../styles/GalleryImageStyles.css";

interface Props {
  imageSource: string;
  imageDescription: string;
}

const SingleAlbumImage = ({ imageSource, imageDescription }: Props) => {
  return (
    <div className="image-item">
        <img src={imageSource} alt={imageDescription} />
        <div className="overlay">
          <span>{imageDescription}</span>
        </div>
    </div>
  );
};

export default SingleAlbumImage;
