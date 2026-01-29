import paiPanorama from "../assets/paiMountains.webp";
import { motion } from "framer-motion";

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative w-full min-h-screen bg-black">
      <motion.ul
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full list-none p-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.li
          className="text-[95px] md:text-[60px] sm:text-[40px] font-semibold text-white drop-shadow-lg"
          variants={itemVariants}
        >
          {heading}
        </motion.li>
        <motion.li
          className="text-[28px] md:text-[24px] sm:text-[20px] text-white drop-shadow-md mt-2.5"
          variants={itemVariants}
        >
          {subHeadingOne}
        </motion.li>
        <motion.li
          className="text-[28px] md:text-[24px] sm:text-[20px] text-white drop-shadow-md mt-2.5"
          variants={itemVariants}
        >
          {subHeadingTwo}
        </motion.li>
      </motion.ul>
      <img
        src={paiPanorama}
        alt="Panorama of Pai, Thailand"
        className="w-full min-h-screen h-auto display-block object-cover"
      />
    </div>
  );
}

export default WelcomeImage;
