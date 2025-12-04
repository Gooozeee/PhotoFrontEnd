import { useRef } from "react";
import WelcomeImage from "../components/WelcomeImage";
import GalleryBanner from "../components/GalleryBanner";
import DownArrow from "../components/DownArrow";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const HomePage = () => {
  const galleryBannerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <WelcomeImage
        heading="Michal Guzy"
        subHeadingOne="Photographer, Software Engineer"
      />
      <div ref={galleryBannerRef}>
        <GalleryBanner title="Image Gallery" />
      </div>
      <DownArrow targetRef={galleryBannerRef} />
      <Footer />
    </motion.div>
  );
};

export default HomePage;
