interface Props {
    imageSource: string;
    imageDescription: string;
}

const GalleryImage = ({imageSource, imageDescription} : Props) => {
  return (
    <div className="image-item">
      <img src={imageSource} alt={imageDescription} />
      <div className="overlay">
        <span>{imageDescription}</span>
      </div>
    </div>
  );
};

export default GalleryImage;
