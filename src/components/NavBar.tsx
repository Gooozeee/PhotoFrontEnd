import "../styles/NavBarStyles.css";
import degooseLogoWhite from "../assets/degooseLogoWhite.webp";
import { useEffect, useState, useCallback } from "react";
import { Twirl as Hamburger } from "hamburger-react";
import { NavLink, Link } from "react-router-dom";

function NavBar() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const listenScrollEvent = useCallback(() => {
    // simple threshold check — treat anything over 20px as scrolled
    const isScrolled = window.scrollY > 20;
    // use console.log so output is visible in browsers with filters
    console.log("[NavBar] scrollY:", window.scrollY, "isScrolled:", isScrolled);
    setScrolledDown(isScrolled);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame(() => {
          listenScrollEvent();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // run once on mount in case the page is already scrolled
    listenScrollEvent();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [listenScrollEvent]);

  // mount-time log to confirm the component is rendered
  useEffect(() => {
    console.log("[NavBar] mounted");
  }, []);

  return (
    <div data-scrolled={scrolledDown} className={`top-banner ${scrolledDown ? "top-banner-black-background" : ""}`}>
      <Link to="/" className="deGooseLogo">
        <img
          src={degooseLogoWhite}
          alt="De Goose Productions Logo"
          className="deGooseLogo"
        />
      </Link>
      <div className={`menu${hamburgerOpen ? "__display" : "__nodisplay"}`}>
        <ul>
          <li>
            <NavLink to="/" className="link">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/software" className="link">
              Software Engineering
            </NavLink>
          </li>
        </ul>
      </div>
      <button
        type="button"
        className="hamburger"
        aria-label="Toggle menu"
        aria-expanded={hamburgerOpen}
      >
        <Hamburger
          toggled={hamburgerOpen}
          toggle={setHamburgerOpen}
          direction="right"
          color="white"
          label="Show menu"
          rounded
        />
      </button>
    </div>
  );
}

export default NavBar;
