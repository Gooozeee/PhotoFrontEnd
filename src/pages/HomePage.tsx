import { useRef } from "react";
import WelcomeImage from "../components/WelcomeImage";
import GalleryBanner from "../components/GalleryBanner";
import Footer from "../components/Footer";

const HomePage = () => {
  const galleryBannerRef = useRef<HTMLDivElement>(null);

  const scrollToGallery = () => {
    galleryBannerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <WelcomeImage
        heading="Michal Guzy"
        subHeadingOne="Photographer, Software Engineer"
        onScrollIndicatorClick={scrollToGallery}
      />
      <div ref={galleryBannerRef}>
        <GalleryBanner title="Image Gallery" />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;