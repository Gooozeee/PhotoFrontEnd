import { FaLinkedin, FaGithub } from "react-icons/fa"
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div>
      <h3 className="bg-black text-center pt-[30px] mt-0 mb-0 font-normal text-white">
        Find me on my socials
      </h3>
      <footer className="flex justify-center text-xs pt-5 bg-black">
        <div className="flex flex-col gap-4 text-center">
          <a
            href="https://www.linkedin.com/in/michal-guzy/"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-white text-lg font-light transition-colors duration-200 hover:text-gray-400 cursor-pointer flex items-center justify-center gap-2"
          >
            <FaLinkedin /> LinkedIn
          </a>
          <a
            href="https://github.com/Gooozeee"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-white text-lg font-light transition-colors duration-200 hover:text-gray-400 cursor-pointer flex items-center justify-center gap-2"
          >
            <FaGithub /> Github
          </a>
          <button
            onClick={() => window.location.href = 'mailto:michalguzym@gmail.com'}
            className="group text-white text-lg font-light transition-colors duration-200 hover:text-gray-400 cursor-pointer flex items-center justify-center gap-2 bg-transparent border-none p-0"
          >
            <MdEmail /> Email me
          </button>
        </div>
      </footer>
      <p className="bg-black text-center text-xs pt-5 mt-0">
        &copy; {new Date().getFullYear()}, Michal Guzy, DeGoose Productions.
      </p>
    </div>
  );
};

export default Footer;
