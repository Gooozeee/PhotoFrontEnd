import paiPanorama from "../assets/paiMountains.webp";
import "../styles/WelcomeImageStyles.css";
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
    <div className="imageContainer">
      <motion.ul
        className="textContainer"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.li className="mainText" variants={itemVariants}>
          {heading}
        </motion.li>
        <motion.li className="subheading" variants={itemVariants}>
          {subHeadingOne}
        </motion.li>
        <motion.li className="subheading" variants={itemVariants}>
          {subHeadingTwo}
        </motion.li>
      </motion.ul>
      <img
        src={paiPanorama}
        alt="Panorama of Pai, Thailand"
        className="bannerImage"
      />
    </div>
  );
}

export default WelcomeImage;
