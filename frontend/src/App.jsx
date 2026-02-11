import Header from "./Main-components/Header/Header.jsx";
import { Outlet, useLocation } from "react-router-dom";
import Scroll from "./Services/scroll.jsx";
import "./App.css";

function App() {
  const location = useLocation();

  const hideLayout = location.pathname === "/authpage";

  return (
    <>
      {!hideLayout && <Header />}
      <Scroll />
      <Outlet />
    </>
  );
}
export default App;
