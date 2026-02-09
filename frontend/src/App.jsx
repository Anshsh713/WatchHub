import Header from "./Main-components/Header/Header.jsx";
import Footer from "./Main-components/Footer/Footer.jsx";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./Context/UserContext";
import "./App.css";

function App() {
  const location = useLocation();

  const hideLayout = location.pathname === "/authpage";

  return (
    <>
      {!hideLayout && <Header />}
      <Outlet />
      {!hideLayout && <Footer />}
    </>
  );
}
export default App;
