import paiPanorama from "../assets/paiMountains.jpg";
import "../styles/WelcomeImageStyles.css";

function WelcomeImage() {
  return (
    <div className="imageContainer">
      <ul className="mainText">
        <li>Michal Guzy</li>
        <li className="subHeading">Photographer</li>
        <li className="subHeading">Software Engineer</li>
      </ul>
      <img
        src={paiPanorama}
        alt="Panorama of Pai, Thailand"
        className="bannerImage"
      />
    </div>
  );
}

export default WelcomeImage;
