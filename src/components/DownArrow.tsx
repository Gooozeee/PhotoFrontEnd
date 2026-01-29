import { useEffect, useState, RefObject, useCallback } from "react";
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
        targetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        const yPosition = targetRef.current.offsetTop;
        scrollToPosition(yPosition);
      }
    }
  };

  return (
    <button
      className={`fixed left-1/2 -translate-x-1/2 text-[1.7rem] cursor-pointer z-[1000] text-white transition-all duration-300 ease-bounce bg-transparent border-none p-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/50 focus-visible:rounded ${
        isOnTop
          ? "bottom-5 animate-float"
          : "bottom-5 pointer-events-none opacity-0"
      } hover:text-gray-600 active:translate-y-0.5`}
      onClick={handleClick}
      aria-label="Scroll to gallery section"
    >
      <SlArrowDown />
    </button>
  );
};

export default DownArrow;
