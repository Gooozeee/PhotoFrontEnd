import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import DownArrow from "../components/DownArrow";
import "../styles/SoftwareEngineeringPageStyles.css";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";

const SoftwareEngineeringPage = () => {
  const images = [HomePage, LandscapePage];

  return (
    <>
      <NavBar />
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer, Specialising in Backend"
      />
      <DownArrow />
      <div className="about-container black">
        <h1 className="title-text">About Me</h1>
        <h2 className="subheading-two subheading-container">
          Here you will find out more about me, and my projects in terms of
          programming and technology
        </h2>
        <div className="section-container">
          <div className="intro-item">
            <h2 className="subheading software-subheading">
              <b>Get to Know Me!</b>
            </h2>
            <p>
              I'm a <b>Backend Focused Developer</b> currently working at PwC as
              a Senior Associate software engineer. Check out some of my work in
              the Projects section.
            </p>
            <p>
              I specialise in <b>C# ASP .Net Core</b> but have university
              experience in other languages and frameworks, and I'm building out
              front ends in my spare time to develop these skills.
            </p>
          </div>
          <div className="intro-item">
            <h2 className="subheading software-subheading">
              <b>Skills</b>
            </h2>
            <div>
              <div className="button skills">C#</div>
              <div className="button skills">Asp.Net Core</div>
              <div className="button skills">SQL</div>
              <div className="button skills">Git</div>
              <div className="button skills">Azure Service Bus</div>
              <div className="button skills">RabbitMQ</div>
              <div className="button skills">Serverless</div>
              <div className="button skills">Kubernetes</div>
              <div className="button skills">JavaScript</div>
              <div className="button skills">React</div>
            </div>
          </div>
        </div>
      </div>
      <div className="about-container gray">
        <div className="project">
          <h1 className="title-text">Projects</h1>
          <h2 className="subheading-two subheading-container">
            Here you will find out more about my programming projects
          </h2>
        </div>
        <div className="projects-container project">
          <div className="image-container">
            <ImageSwitcher images={images} />
          </div>
          <div className="text-container">
            <h1 className="title-text project-heading">
              Photography Portfolio
            </h1>
            <p className="project-text">
              Custom website built in <b>React Typescript</b> with the use of
              Vite to practice and showcase my skills in front end development.
              I have plans to extend the system further and include a backend
              for storing the images in blob storage, and including liking,
              commenting and sorting functionality on the website.
            </p>
            <a href="https://github.com/Gooozeee/PhotoFrontEnd" target="_blank">
              <div className="button project-button">Github Repository</div>
            </a>
            <a href="https://www.michalguzy.com" target="_blank">
              <div className="button project-button">Live URL</div>
            </a>
          </div>
        </div>
        <h1 className="title-text final-message">
          Head to my GitHub to see more projects! (I will be bringing more here
          soon)
        </h1>
      </div>
      <Footer />
    </>
  );
};

export default SoftwareEngineeringPage;
