import "./App.css";
import GalleryBanner from "./components/GalleryBanner";
import NavBar from "./components/NavBar";
import WelcomeImage from "./components/WelcomeImage";

function App() {
  return (
    <div className="App">
      <NavBar />
      <WelcomeImage />
      <h1>Michal</h1>
      <h1>Something about me</h1>
      <GalleryBanner title="Birds"/>
      <GalleryBanner title="Animals"/>
      <GalleryBanner title="Racecars"/>
    </div>
  );
}

export default App;
