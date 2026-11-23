import Header from "./Main-components/Header/Header.jsx";
import Footer from "./Main-components/Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./Context/UserContext.jsx";
import Scroll from "./Services/scroll.jsx";
import "./App.css";
import { useEffect } from "react";

function App() {
  const location = useLocation();
  const { getMe } = useAuth();
  const hideLayout = location.pathname === "/authpage";

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    resetScroll();
    const firstFrame = window.requestAnimationFrame(resetScroll);
    const secondFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resetScroll);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.key]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe();
    }
  }, []);

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <Scroll />}
      <Outlet />
      {!hideLayout && <Footer />}
    </>
  );
}
export default App;
