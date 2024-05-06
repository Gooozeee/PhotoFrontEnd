import paiPanorama from "../assets/paiMountains.jpg";

function WelcomeImage() {
  return (
    <div className="imageContainer">
      <img
        src={paiPanorama}
        alt="Panorama of Pai, Thailand"
        className="bannerImage"
      />
    </div>
  );
}

export default WelcomeImage;
