import "../styles/NavBarStyles.css";
import degooseLogoWhite from "../assets/degooseLogoWhite.webp";
import { useEffect, useState } from "react";
import { Twirl as Hamburger } from "hamburger-react";
import { Link } from "react-router-dom";

function NavBar() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
    console.log(hamburgerOpen);
  };

  const listenScrollEvent = () => {
    if (window.scrollY < 20) {
      return setScrolledDown(false);
    } else if (window.scrollY > 10) {
      return setScrolledDown(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", listenScrollEvent);

    return () => window.removeEventListener("scroll", listenScrollEvent);
  }, []);

  return (
    <div
      className={scrolledDown ? "top-banner-black-background" : "top-banner"}
    >
      <Link to="/" className="link">
        <img
          src={degooseLogoWhite}
          alt="Panorama of Pai, Thailand"
          className="deGooseLogo"
        />
      </Link>
      <div className={`menu${hamburgerOpen ? "__display" : "__nodisplay"}`}>
        <ul>
          <li>
            <Link to="/" className="link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/software" className="link">
              Software Engineering
            </Link>
          </li>
          <li>
            <Link to="/construction" className="link">
              About
            </Link>
          </li>
        </ul>
      </div>
      <div className="hamburger" onClick={() => toggleHamburger()}>
        <Hamburger
          toggled={hamburgerOpen}
          toggle={setHamburgerOpen}
          direction="right"
          color="white"
          label="Show menu"
          rounded
        />
      </div>
    </div>
  );
}

export default NavBar;
