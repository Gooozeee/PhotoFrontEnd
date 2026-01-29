import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import SingleAlbumPage from "./pages/SingleAlbumPage";
import SoftwareEngineeringPage from "./pages/SoftwareEngineeringPage";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/construction" element={<UnderConstructionPage />} />
            <Route path="/singleAlbum" element={<SingleAlbumPage />} />
            <Route path="/software" element={<SoftwareEngineeringPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
