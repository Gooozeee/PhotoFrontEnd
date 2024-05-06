import '../styles/navBarStyles.css'
import degooseLogoWhite from "../assets/degooseLogoWhite.png";

function NavBar() {
  return (
    <div className="topBanner">
      <img
        src={degooseLogoWhite}
        alt="Panorama of Pai, Thailand"
        className="deGooseLogo"
      />
      <ul className="menu">
        <li>Software Engineering</li>     
        <li>Albums</li>
        <li>About</li>
        <li>Back to Top</li>
      </ul>
    </div>
  );
}

export default NavBar;
