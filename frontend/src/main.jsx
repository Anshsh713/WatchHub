import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./Data_Management/Store.js";
import { UserProvider } from "./Context/UserContext.jsx";
import { MediaProvider } from "./Context/MediaContext.jsx";
import { MediaReviewsProvider } from "./Context/MediaReviewsContext.jsx";
import Home from "./Components/Home/Home.jsx";
import Protected from "./Data_Management/Protected.jsx";
import AuthPage from "./Login_Signup/AuthPage/AuthPage.jsx";
import MediaDetials from "./Components/MovieDetails/MovieDetails.jsx";
import App from "./App.jsx";
import "./index.css";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/home" /> },

      { path: "authpage", element: <AuthPage /> },

      {
        path: "home",
        element: (
          <Protected>
            <Home />
          </Protected>
        ),
      },
      {
        path: "/media/:type/:id",
        element: (
          <Protected>
            <MediaDetials />
          </Protected>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <UserProvider>
        <ErrorBoundary>
          <MediaProvider>
            <MediaReviewsProvider>
              <RouterProvider router={router} />
            </MediaReviewsProvider>
          </MediaProvider>
        </ErrorBoundary>
      </UserProvider>
    </Provider>
  </StrictMode>,
);
