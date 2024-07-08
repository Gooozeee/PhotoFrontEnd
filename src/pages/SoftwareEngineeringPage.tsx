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
