import Header from "./Main-components/Header/Header.jsx";
import Footer from "./Main-components/Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import Scroll from "./Services/scroll.jsx";
import "./App.css";

function App() {
  const location = useLocation();

  const hideLayout = location.pathname === "/authpage";

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
