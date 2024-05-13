import "./App.css";
import HomePage from "./Pages/HomePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./Pages/NotFoundPage";
import UnderConstructionPage from "./Pages/UnderConstructionPage";

function App() {
  const router = createBrowserRouter([{
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  }, {
    path: '/construction',
    element: <UnderConstructionPage />,
    errorElement: <NotFoundPage />
  }]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
