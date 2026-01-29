import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import DownArrow from "../components/DownArrow";
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
      <div
        id="about"
        className="bg-[rgb(12,12,12)] pt-12 md:pt-[50px] flex flex-col items-center w-full"
        ref={aboutRef}
      >
        <h1 className="text-white font-light text-2xl text-center">About Me</h1>
        <h2 className="text-lg font-light text-center pt-5 pb-[30px] px-5">
          Here you will find out more about me, and my projects in terms of
          programming and technology
        </h2>
        <div className="w-[95%] pt-[50px] pb-[60px] flex flex-col md:flex-row gap-[100px] md:gap-0">
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-light text-left md:text-center mb-4">
              <b>Get to Know Me!</b>
            </h2>
            <p className="mb-4">
              I'm a <b>Backend Focused Developer</b> currently working at
              Simcorp as a Senior software engineer.
            </p>
            <p>
              I specialise in <b>C# ASP .Net Core</b> backend development, and
              enjoy front end development on the side.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-light text-left md:text-center mb-4">
              <b>Skills</b>
            </h2>
            <div className="flex flex-wrap gap-1 md:justify-center">
              {[
                "C#",
                "Asp.Net Core",
                "SQL",
                "Git",
                "Azure Service Bus",
                "RabbitMQ",
                "Serverless",
                "Kubernetes",
                "JavaScript",
                "React",
              ].map((skill) => (
                <div
                  key={skill}
                  className="inline-block text-sm font-normal bg-[#333] text-white px-2.5 py-1.5 rounded transition-all duration-500 hover:-translate-y-1.5 hover:bg-[#555]"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div id="projects" className="bg-[rgb(25,25,25)] w-full flex flex-col items-center">
        <div className="w-[95%]">
          <h1 className="text-white font-light text-2xl text-center pt-[50px]">
            Projects
          </h1>
          <h2 className="text-lg font-light text-center pt-5 pb-[30px]">
            Here you will find out more about my programming projects
          </h2>
        </div>
        <div className="w-[95%] h-[600px] gap-[100px] flex flex-col md:flex-row pb-[60px]">
          <div className="flex items-center justify-center w-full h-full md:-mt-5 relative">
            <ImageSwitcher images={images} />
          </div>
          <div className="w-full pt-[60px]">
            <h1 className="text-white font-light text-2xl text-left mb-5">
              Photography Portfolio
            </h1>
            <p className="mb-4">
              Custom website built in <b>React Typescript</b> with the use of
              Vite to practice and showcase my skills in front end development.
              I have plans to extend the system further and include a backend
              for storing the images in blob storage, and including liking,
              commenting and sorting functionality on the website.
            </p>
          </div>
        </div>
        <h1 className="text-white font-light text-2xl text-center w-[70%] pb-[50px]">
          Head to my GitHub to see more projects! (I will be bringing more here
          soon)
        </h1>
      </div>
      <Footer />
    </motion.div>
  );
};

export default SoftwareEngineeringPage;
