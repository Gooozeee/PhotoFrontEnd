import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import DownArrow from "../components/DownArrow";
import "../styles/SoftwareEngineeringPageStyles.css";

const SoftwareEngineeringPage = () => {
  return (
    <>
      <NavBar />
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer, Specialising in Backend"
      />
      <DownArrow />
      <div className="about-container">
        <h1 className="title-text">About Me</h1>
        <h2 className="subheading-two subheading-container">
          Here you will find out more about me, and my projects in terms of
          programming and technology
        </h2>
        <div className="intro-container">
          <div className="intro-item">
            <h2 className="subheading">Introduction</h2>
          </div>
          <div className="intro-item">
            <h2 className="subheading">Skills</h2>
          </div>
        </div>
      </div>
      <div className="about-container">
        <h1 className="title-text">Projects</h1>
        <h2 className="subheading-two subheading-container">
          Here you will find out more about my programming projects
        </h2>
      </div>
      <Footer />
    </>
  );
};

export default SoftwareEngineeringPage;
