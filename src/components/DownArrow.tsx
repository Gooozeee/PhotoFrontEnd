import { useEffect, useState } from "react";
import "../styles/DownArrowStyles.css";
import { SlArrowDown } from "react-icons/sl";

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

  const handleScroll = () => {
    window.scrollBy({
      top: 1200,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={isOnTop ? "down-arrow" : "down-arrow-disabled"}
      onClick={handleScroll}
    >
      <SlArrowDown />
    </div>
  );
};

export default DownArrow;
