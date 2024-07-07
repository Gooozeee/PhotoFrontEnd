import { Link } from "react-router-dom";
import { FaLinkedin, FaGithub } from "react-icons/fa"
import { MdEmail } from "react-icons/md";

const Footer = () => {
  return (
    <div>
      <h3 className="footer-title">Find me on my socials</h3>
      <footer className="footer">
        <div>
          <a href="https://www.linkedin.com/in/michal-guzy/" target="_blank">
            <h3 className="subheading-two"><FaLinkedin /> LinkedIn</h3>
          </a>
          <a href="https://github.com/Gooozeee" target="_blank">
            <h3 className="subheading-two"><FaGithub /> Github</h3>
          </a>
          <div onClick={() => window.location.href = 'mailto:michalguzym@gmail.com'}>
            <h3 className="subheading-two point"><MdEmail /> Email me</h3>
          </div>
        </div>
      </footer>
      <p className="footer-copyright">
        &copy; {new Date().getFullYear()}, Michal Guzy, DeGoose Productions.
      </p>
    </div>
  );
};

export default Footer;
