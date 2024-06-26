import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";
import GalleryBanner from "../components/GalleryBanner";
import DownArrow from "../components/DownArrow";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <>
      <NavBar />
      <WelcomeImage
        heading="Michal Guzy"
        subHeadingOne="Photographer, Software Engineer"
      />
      <GalleryBanner title="Image Gallery" />
      <DownArrow />
      <Footer />
    </>
  );
};

export default HomePage;
