import degooseLogoWhite from "../assets/degooseLogoWhite.webp";
import { useEffect, useState, useCallback } from "react";
import { Twirl as Hamburger } from "hamburger-react";
import { NavLink, Link } from "react-router-dom";

function NavBar() {
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  const listenScrollEvent = useCallback(() => {
    const isScrolled = window.scrollY > 20;
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

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-7 transition-all duration-300 ease-out ${
        scrolledDown
          ? "bg-black h-[70px] shadow-lg"
          : "bg-transparent h-[100px]"
      }`}
    >
      <Link
        to="/"
        className={`flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-105 active:scale-98 z-10 ${
          scrolledDown ? "w-[150px] my-1.5" : "w-[200px] my-3.75"
        }`}
      >
        <img
          src={degooseLogoWhite}
          alt="De Goose Productions Logo"
          className="w-full h-auto"
        />
      </Link>

      {/* Desktop Menu */}
      <div
        className={`hidden lg:flex items-center gap-7 transition-all duration-300 ease-out ${
          hamburgerOpen ? "opacity-0" : "opacity-100"
        }`}
      >
        <ul className="flex gap-6 list-none m-0 p-0 items-center">
          <li className="text-base font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative transition-colors duration-200 ease-out group ${
                  isActive ? "text-white" : "text-white hover:text-gray-400"
                }`
              }
            >
              Home
              <span className="absolute bottom-[-6px] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 transition-transform duration-200 ease-bounce origin-right group-hover:origin-left" />
            </NavLink>
          </li>
          <li className="text-base font-medium">
            <NavLink
              to="/software"
              className={({ isActive }) =>
                `relative transition-colors duration-200 ease-out group ${
                  isActive ? "text-white" : "text-white hover:text-gray-400"
                }`
              }
            >
              Software Engineering
              <span className="absolute bottom-[-6px] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 transition-transform duration-200 ease-bounce origin-right group-hover:origin-left" />
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-sm flex-col justify-center items-center z-40 transition-all duration-300 ease-out lg:hidden ${
          hamburgerOpen
            ? "flex opacity-100 pointer-events-auto"
            : "hidden opacity-0 pointer-events-none"
        }`}
      >
        <ul className="w-full text-center flex flex-col justify-center items-center gap-7 list-none p-0 m-0">
          <li
            className={`text-xl font-semibold text-white transition-all duration-300 ease-out ${
              hamburgerOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{
              transitionDelay: hamburgerOpen ? "40ms" : "0ms",
            }}
          >
            <NavLink
              to="/"
              className="hover:text-gray-400 transition-colors duration-200"
              onClick={() => setHamburgerOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li
            className={`text-xl font-semibold text-white transition-all duration-300 ease-out ${
              hamburgerOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{
              transitionDelay: hamburgerOpen ? "80ms" : "0ms",
            }}
          >
            <NavLink
              to="/software"
              className="hover:text-gray-400 transition-colors duration-200"
              onClick={() => setHamburgerOpen(false)}
            >
              Software Engineering
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Hamburger Menu Button */}
      <button
        type="button"
        className="block lg:hidden absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-transparent border-none cursor-pointer p-1.5 mr-2"
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
    </nav>
  );
}

export default NavBar;
