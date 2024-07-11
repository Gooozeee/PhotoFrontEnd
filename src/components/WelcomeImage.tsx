import paiPanorama from "../assets/paiMountains.webp";
import "../styles/WelcomeImageStyles.css";
import scrollToPosition from "../utils/scrollToPosition";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleClick = (path: string, yPosition: number) => {
    navigate(path);
    setTimeout(() => {
      scrollToPosition(yPosition);
    }, 100)
  }

  return (
    <div className="imageContainer">
      <ul className="textContainer">
        <li className="mainText">{heading}</li>
        <li className="subheading">{subHeadingOne}</li>
        <li className="subheading">{subHeadingTwo}</li>
        <div className="button-container">
          <button className="button" onClick={() => handleClick('/software', 1200)}>
            Projects
          </button>
          <button className="button" onClick={() => handleClick('/', 1200)}>
            Photography
          </button>
        </div>
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
