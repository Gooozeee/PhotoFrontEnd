import "./App.css";
import HomePage from "./pages/HomePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";
import SingleAlbumPage from "./pages/SingleAlbumPage";
import SoftwareEngineeringPage from "./pages/SoftwareEngineeringPage";

function App() {
  const router = createBrowserRouter([{
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  }, {
    path: '/construction',
    element: <UnderConstructionPage />,
    errorElement: <NotFoundPage />
  }, {
    path: '/singleAlbum',
    element: <SingleAlbumPage />,
    errorElement: <NotFoundPage />
  }, {
    path: '/software',
    element: <SoftwareEngineeringPage />,
    errorElement: <NotFoundPage />
  }]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
