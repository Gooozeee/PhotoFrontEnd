import paiPanorama from "../assets/paiMountains.webp";
import "../styles/WelcomeImageStyles.css";

interface Props {
  heading: string;
  subHeadingOne: string;
  subHeadingTwo?: string;
}

function WelcomeImage({
  heading,
  subHeadingOne,
  subHeadingTwo,
}: Readonly<Props>) {
  return (
    <div className="imageContainer">
      <ul className="textContainer">
        <li className="mainText">{heading}</li>
        <li className="subheading">{subHeadingOne}</li>
        <li className="subheading">{subHeadingTwo}</li>
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
