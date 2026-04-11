import degooseLogoWhite from "../assets/degooseLogoWhite.webp";
import { useEffect, useState, useCallback } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function NavBar() {
  const shouldReduceMotion = useReducedMotion();
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
    listenScrollEvent();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [listenScrollEvent]);

  const navVariants = {
    initial: { y: -100 },
    animate: {
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/software", label: "Work" },
  ];

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className="fixed top-0 w-full z-50 flex flex-col bg-[#09090B]/40 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-500"
    >
      <div className={`flex justify-between items-center px-6 md:px-10 transition-all duration-500 ${
        scrolledDown ? "h-[70px]" : "h-[90px]"
      }`}>
        <Link
          to="/"
          className={`flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:scale-105 active:scale-98 z-10 ${
            scrolledDown ? "w-[120px]" : "w-[160px]"
          }`}
        >
          <img
            src={degooseLogoWhite}
            alt="De Goose Productions Logo"
            className="w-full h-auto"
          />
        </Link>

        <div
          className={`hidden lg:flex items-center gap-8 transition-opacity duration-300 ${
            hamburgerOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          <ul className="flex gap-8 list-none m-0 p-0 items-center">
            {menuItems.map((item) => (
              <li key={item.to} className="relative group">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-[0.05em] uppercase py-2 block transition-colors duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-white/60 hover:text-white"
                    }`
                  }
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="block lg:hidden z-[60] bg-transparent border-none cursor-pointer p-2 ml-auto"
          aria-label="Toggle menu"
          aria-expanded={hamburgerOpen}
          onClick={() => setHamburgerOpen(!hamburgerOpen)}
        >
          <div className="flex flex-col gap-1.5 w-6">
            <span className={`block h-0.5 bg-white transition-all duration-300 ${hamburgerOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-white transition-all duration-300 ${hamburgerOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-white transition-all duration-300 ${hamburgerOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {hamburgerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#09090B]/60 backdrop-blur-lg border-t border-white/[0.08] overflow-hidden"
          >
            <ul className="flex flex-col py-4 list-none text-center">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className="block py-4 text-2xl font-semibold text-white hover:text-white/60 transition-colors duration-200"
                    style={{ fontFamily: "'Archivo', sans-serif" }}
                    onClick={() => setHamburgerOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default NavBar;