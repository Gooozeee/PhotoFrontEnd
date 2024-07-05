import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import DownArrow from "../components/DownArrow";

const SoftwareEngineeringPage = () => {
  return (
    <>
      <NavBar />
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer, Specialising in Backend"
      />
      <DownArrow />
      <Footer />
    </>
  );
};

export default SoftwareEngineeringPage;
