import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import SingleAlbumPage from "./pages/SingleAlbumPage";
import SoftwareEngineeringPage from "./pages/SoftwareEngineeringPage";
import AdminPage from "./pages/AdminPage";
import RequireAdminSession from "./pages/admin/RequireAdminSession";
import UploadPage from "./pages/admin/UploadPage";
import AlbumsPage from "./pages/admin/AlbumsPage";
import PhotosPage from "./pages/admin/PhotosPage";
import MetadataQueuePage from "./pages/admin/MetadataQueuePage";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route element={<RequireAdminSession />}>
            <Route path="/admin/upload" element={<UploadPage />} />
            <Route path="/admin/albums" element={<AlbumsPage />} />
            <Route path="/admin/photos" element={<PhotosPage />} />
            <Route path="/admin/metadata" element={<MetadataQueuePage />} />
          </Route>
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
