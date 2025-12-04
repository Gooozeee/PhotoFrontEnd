import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import DownArrow from "../components/DownArrow";
import "../styles/SoftwareEngineeringPageStyles.css";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { motion } from "framer-motion";
import { useRef } from "react";

const SoftwareEngineeringPage = () => {
  const images = [HomePage, LandscapePage];
  const aboutRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer, Specialising in Backend"
      />
      <DownArrow targetRef={aboutRef} />
      <div id="about" className="about-container black" ref={aboutRef}>
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
              I'm a <b>Backend Focused Developer</b> currently working at
              Simcorp as a Senior software engineer.
            </p>
            <p>
              I specialise in <b>C# ASP .Net Core</b> backend development, and
              enjoy front end development on the side.
            </p>
          </div>
          <div className="intro-item">
            <h2 className="subheading software-subheading">
              <b>Skills</b>
            </h2>
            <div>
              <div className="skills">C#</div>
              <div className="skills">Asp.Net Core</div>
              <div className="skills">SQL</div>
              <div className="skills">Git</div>
              <div className="skills">Azure Service Bus</div>
              <div className="skills">RabbitMQ</div>
              <div className="skills">Serverless</div>
              <div className="skills">Kubernetes</div>
              <div className="skills">JavaScript</div>
              <div className="skills">React</div>
            </div>
          </div>
        </div>
      </div>
      <div id="projects" className="about-container gray">
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
              <div className="project-button-link project-button">
                Github Repository
              </div>
            </a>
            <a href="https://www.michalguzy.com" target="_blank">
              <div className="project-button-link project-button">Live URL</div>
            </a>
          </div>
        </div>
        <h1 className="title-text final-message">
          Head to my GitHub to see more projects! (I will be bringing more here
          soon)
        </h1>
      </div>
      <Footer />
    </motion.div>
  );
};

export default SoftwareEngineeringPage;
