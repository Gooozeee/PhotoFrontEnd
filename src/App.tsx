import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import SingleAlbumPage from "./pages/SingleAlbumPage";
import SoftwareEngineeringPage from "./pages/SoftwareEngineeringPage";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/construction" element={<UnderConstructionPage />} />
          <Route path="/singleAlbum" element={<SingleAlbumPage />} />
          <Route path="/software" element={<SoftwareEngineeringPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;