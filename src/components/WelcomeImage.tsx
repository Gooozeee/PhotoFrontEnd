import paiPanorama from "../assets/paiMountains.jpg";
import "../styles/WelcomeImageStyles.css";

interface Props {
  heading: string;
  subHeadingOne: string;
  subHeadingTwo?: string;
}

function WelcomeImage({ heading, subHeadingOne, subHeadingTwo }: Props) {
  return (
    <div className="imageContainer">
      <ul className="mainText">
        <li>{heading}</li>
        <li className="subHeading">{subHeadingOne}</li>
        <li className="subHeading">{subHeadingTwo}</li>
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
