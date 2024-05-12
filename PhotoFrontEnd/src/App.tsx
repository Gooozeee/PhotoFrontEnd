import "./App.css";
import GalleryBanner from "./components/GalleryBanner";
import NavBar from "./components/NavBar";
import WelcomeImage from "./components/WelcomeImage";

function App() {
  return (
    <div className="App">
      <NavBar />
      <WelcomeImage />
      <GalleryBanner title="Birds"/>
    </div>
  );
}

export default App;
