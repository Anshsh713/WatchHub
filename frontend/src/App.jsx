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
