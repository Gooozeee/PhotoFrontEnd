import { useEffect, useState } from "react";
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
  const handleScroll = () => {
    window.scrollBy({
      top: 1200,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="imageContainer">
      <ul className="textContainer">
        <li className="mainText">{heading}</li>
        <li className="subHeading">{subHeadingOne}</li>
        <li className="subHeading">{subHeadingTwo}</li>
        <div className="button-container">
          <div className="button" onClick={handleScroll}>
            Projects
          </div>
          <div className="button" onClick={handleScroll}>
            Photography
          </div>
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
