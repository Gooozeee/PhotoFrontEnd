import { useEffect, useState } from "react";
import "../styles/DownArrowStyles.css";
import { SlArrowDown } from "react-icons/sl";
import scrollToPosition from "../utils/scrollToPosition";

const DownArrow = () => {
  const [isOnTop, setIsOnTop] = useState(true);

  useEffect(() => {
    const handleScrollToTop = () => {
      if (window.scrollY <= 100) {
        setIsOnTop(true);
      } else {
        setIsOnTop(false);
      }
    };

    window.addEventListener('scroll', handleScrollToTop);

    return () => {
        window.removeEventListener('scroll', handleScrollToTop);
    }
  }, []);

  return (
    <div
      className={isOnTop ? "down-arrow" : "down-arrow-disabled"}
      onClick={() => scrollToPosition(1200)}
    >
      <SlArrowDown />
    </div>
  );
};

export default DownArrow;
