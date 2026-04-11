import paiPanorama from "../assets/paiMountains.webp";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { IoChevronDown } from "react-icons/io5";

interface Props {
  heading: string;
  subHeadingOne: string;
  subHeadingTwo?: string;
  onScrollIndicatorClick?: () => void;
}

function WelcomeImage({
  heading,
  subHeadingOne,
  subHeadingTwo,
  onScrollIndicatorClick,
}: Readonly<Props>) {
  const shouldReduceMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = paiPanorama;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      };

  return (
    <div className="relative w-full min-h-screen bg-[#09090B] overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={paiPanorama}
          alt="Panorama of Pai, Thailand"
          className={`w-full min-h-screen h-auto object-cover ${
            shouldReduceMotion ? "" : "ken-burns"
          }`}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      <div className="absolute inset-0 vignette" />

      <motion.ul
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full list-none p-0 z-10"
        variants={containerVariants}
        initial="hidden"
        animate={showContent ? "visible" : "hidden"}
      >
        <motion.li
          className="text-[clamp(2.5rem,8vw,6rem)] font-semibold text-white tracking-tight text-reveal"
          variants={itemVariants}
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          {heading}
        </motion.li>
        <motion.li
          className="text-[clamp(1.25rem,2.5vw,1.75rem)] text-white/90 mt-3 tracking-wide font-light"
          variants={itemVariants}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {subHeadingOne}
        </motion.li>
        {subHeadingTwo && (
          <motion.li
            className="text-[clamp(1.25rem,2.5vw,1.75rem)] text-white/90 mt-1 tracking-wide font-light"
            variants={itemVariants}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {subHeadingTwo}
          </motion.li>
        )}
      </motion.ul>

      <motion.div
        className="absolute bottom-6 left-0 right-0 flex justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ delay: shouldReduceMotion ? 0 : 1.2 }}
      >
        <button
          className="flex flex-col items-center text-white/60 cursor-pointer bg-transparent border-none p-0"
          onClick={onScrollIndicatorClick}
        >
          <span className="text-xs tracking-[0.2em] uppercase mb-1">Explore</span>
          <motion.div
            animate={shouldReduceMotion ? {} : { y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <IoChevronDown size={18} />
          </motion.div>
        </button>
      </motion.div>
    </div>
  );
}

export default WelcomeImage;