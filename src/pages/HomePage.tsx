import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";
import GalleryBanner from "../components/GalleryBanner";
import DownArrow from "../components/DownArrow";

const HomePage = () => {
  return (
    <>
      <NavBar />
      <WelcomeImage
        heading="Michal Guzy"
        subHeadingOne="Photographer"
        subHeadingTwo="Software Engineer"
      />
      <GalleryBanner title="Image Gallery" />
      <DownArrow />
    </>
  );
};

export default HomePage;
