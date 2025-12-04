import { useEffect, useState, RefObject, useCallback } from "react";
import "../styles/DownArrowStyles.css";
import { SlArrowDown } from "react-icons/sl";
import scrollToPosition from "../utils/scrollToPosition";

interface Props {
  targetRef: RefObject<HTMLDivElement>;
}

const DownArrow = ({ targetRef }: Props) => {
  const [isOnTop, setIsOnTop] = useState(true);

  const handleScrollToTop = useCallback(() => {
    if (window.scrollY <= 100) {
      setIsOnTop(true);
    } else {
      setIsOnTop(false);
    }
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        globalThis.requestAnimationFrame(() => {
          handleScrollToTop();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [handleScrollToTop]);

  const handleClick = () => {
    if (targetRef.current) {
      // use scrollIntoView for more robust scrolling (accounts for layout)
      if (typeof targetRef.current.scrollIntoView === "function") {
        targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const yPosition = targetRef.current.offsetTop;
        scrollToPosition(yPosition);
      }
    }
  };

  return (
    <button
      className={isOnTop ? "down-arrow" : "down-arrow-disabled"}
      onClick={handleClick}
      aria-label="Scroll to gallery section"
    >
      <SlArrowDown />
    </button>
  );
};

export default DownArrow;
