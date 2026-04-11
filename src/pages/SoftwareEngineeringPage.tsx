import WelcomeImage from "../components/WelcomeImage";
import Footer from "../components/Footer";
import HomePage from "../assets/Projects/Website/HomePage.png";
import LandscapePage from "../assets/Projects/Website/LandscapePage.png";
import ImageSwitcher from "../components/ImageSwitcher";
import { useRef } from "react";

const SoftwareEngineeringPage = () => {
  const images = [HomePage, LandscapePage];
  const aboutRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#09090B]">
      <WelcomeImage
        heading="Hey! I'm Michal Guzy"
        subHeadingOne="A Full-Stack Software Engineer, Specialising in Backend"
        onScrollIndicatorClick={scrollToAbout}
      />
      <div
        id="about"
        className="pt-10 md:pt-12 flex flex-col items-center w-full px-4"
        ref={aboutRef}
      >
        <h1 
          className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          About Me
        </h1>
        <h2 
          className="text-white/60 text-base font-light text-center pt-3 pb-8 px-5 max-w-xl"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Here you will find out more about me, and my projects in terms of programming and technology
        </h2>
        <div className="w-full max-w-4xl py-8 flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/2">
            <h2 
              className="text-white text-lg font-light mb-4"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
              Get to Know Me!
            </h2>
            <p className="text-white/70 mb-4 leading-relaxed text-sm md:text-base">
              I'm a <span className="text-white font-medium">Backend Focused Developer</span> currently working at Simcorp as a Senior software engineer.
            </p>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              I specialise in <span className="text-white font-medium">C# ASP .Net Core</span> backend development, and enjoy front end development on the side.
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <h2 
              className="text-white text-lg font-light mb-4"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
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
                  className="text-sm font-normal bg-[#27272A] text-white/80 px-3 py-1.5 rounded transition-all duration-300 hover:bg-[#3F3F46] hover:text-white"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div id="projects" className="w-full flex flex-col items-center border-t border-white/[0.08] px-4">
        <div className="w-full max-w-4xl">
          <h1 
            className="text-white font-light text-[clamp(1.5rem,4vw,2rem)] text-center pt-10"
            style={{ fontFamily: "'Archivo', sans-serif" }}
          >
            Projects
          </h1>
          <h2 
            className="text-white/60 text-base font-light text-center pt-3 pb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Here you will find out more about my programming projects
          </h2>
        </div>
        <div className="w-full max-w-4xl gap-8 flex flex-col md:flex-row py-8 items-center">
          <div className="flex items-center justify-center w-full md:w-1/2">
            <ImageSwitcher images={images} />
          </div>
          <div className="w-full md:w-1/2">
            <h1 
              className="text-white font-light text-lg md:text-xl mb-4"
              style={{ fontFamily: "'Archivo', sans-serif" }}
            >
              Photography Portfolio
            </h1>
            <p className="text-white/70 mb-4 leading-relaxed text-sm md:text-base">
              Custom website built in <span className="text-white font-medium">React Typescript</span> with Vite to practice and showcase my skills in front end development.
            </p>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              I plan to extend the system further and include a backend for storing images in blob storage, with liking, commenting and sorting functionality.
            </p>
          </div>
        </div>
        <h1 className="text-white/60 font-light text-center w-full max-w-xl px-4 pb-12 text-sm md:text-base">
          Head to my GitHub to see more projects! (More coming soon)
        </h1>
      </div>
      <Footer />
    </div>
  );
};

export default SoftwareEngineeringPage;
