import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import WelcomeImage from "../components/WelcomeImage";

const NotFoundPage = () => {
  return (
    <>
        <NavBar />
        <WelcomeImage heading="404 Page Not Found" subHeadingOne="Come back for more information"/>
        <Footer />
    </>
  );
};

export default NotFoundPage;
