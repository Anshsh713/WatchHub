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
import { NewsProvider } from "./Context/NewsContext.jsx";
import { NewsCommentsProvider } from "./Context/News_CommentsConstext.jsx";
import { FranchiseProvider } from "./Context/FranchiseContext.jsx";
import { DiscoverProvider } from "./Context/DiscoverContext.jsx";
import { WatchListProvider } from "./Context/WatchListContext.jsx";
import Home from "./Components/Home/Home.jsx";
import Protected from "./Data_Management/Protected.jsx";
import AuthPage from "./Login_Signup/AuthPage/AuthPage.jsx";
import MediaDetials from "./Components/MovieDetails/MovieDetails.jsx";
import Explore_Interface from "./Components/Explore/Explore_Interface/Interface.jsx";
import Explore from "./Components/Explore/Explore/Explore.jsx";
import FranchiseList from "./Components/Explore/Franchise/FranchiseList.jsx";
import FranchiseDetails from "./Components/Explore/Franchise/FranchiseDetails.jsx";
import WatchList from "./Components/WatchList/WatchList.jsx";
import Main_Page from "./Components/News/Main_Page.jsx";
import Detail from "./Components/News/News_Events_Details.jsx/Detail.jsx";
import Discover from "./Components/Discover/Discover.jsx";
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
      {
        path: "interface",
        element: (
          <Protected>
            <Explore_Interface />
          </Protected>
        ),
      },
      {
        path: "discover",
        element: (
          <Protected>
            <Discover />
          </Protected>
        ),
      },
      {
        path: "/watchlist",
        element: (
          <Protected>
            <WatchList />
          </Protected>
        ),
      },
      {
        path: "/explore/franchise",
        element: (
          <Protected>
            <FranchiseList />
          </Protected>
        ),
      },
      {
        path: "/explore/franchise/:slug",
        element: (
          <Protected>
            <FranchiseDetails />
          </Protected>
        ),
      },
      {
        path: "/explore/:category",
        element: (
          <Protected>
            <Explore />
          </Protected>
        ),
      },
      {
        path: "/:type/:id",
        element: (
          <Protected>
            <Explore />
          </Protected>
        ),
      },
      {
        path: "/insider",
        element: (
          <Protected>
            <Main_Page />
          </Protected>
        ),
      },
      {
        path: "/news/:articleId",
        element: (
          <Protected>
            <Detail />
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
          <NewsProvider>
            <NewsCommentsProvider>
              <MediaProvider>
                <MediaReviewsProvider>
                  <FranchiseProvider>
                    <DiscoverProvider>
                      <WatchListProvider>
                        <RouterProvider router={router} />
                      </WatchListProvider>
                    </DiscoverProvider>
                  </FranchiseProvider>
                </MediaReviewsProvider>
              </MediaProvider>
            </NewsCommentsProvider>
          </NewsProvider>
        </ErrorBoundary>
      </UserProvider>
    </Provider>
  </StrictMode>,
);
