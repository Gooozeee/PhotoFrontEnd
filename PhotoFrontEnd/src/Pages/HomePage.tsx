import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";
import GalleryBanner from "../components/GalleryBanner";

const HomePage = () => {
  return (
    <>
      <NavBar />
      <WelcomeImage />
      <GalleryBanner title="Birds" />
    </>
  );
};

export default HomePage;
