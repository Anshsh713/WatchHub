import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, Menu, X, NotebookPen, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import "./Header.css";
import { useMedia } from "../../Context/MediaContext";

export default function Header() {
  const { currentType } = useMedia();
  const { user } = useSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userWork, setUserWork] = useState(false);
  const location = useLocation();

  let themeClass = "";
  if (currentType === "movie") themeClass = "theme-movie";
  else if (currentType === "tv") themeClass = "theme-tv";
  else if (currentType === "anime") themeClass = "theme-anime";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-box")) {
        setUserWork(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Schedule", path: "/schedule" },
    { name: "Clubs", path: "/clubs" },
    { name: "News", path: "/news" },
    { name: "Collections", path: "/collections" },
    { name: "WatchList", path: "/watchlist" },
    { name: "Explore", path: "/category" },
  ];

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""} ${themeClass}`}>
      <div className="container header-container">
        <div className="header-left">
          <Link to="/home" className="logo">
            Watch<span className="logo-accent">Hub</span>
          </Link>
        </div>

        <div className="header-right">
          <nav className="desktop-nav">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={location.pathname === link.path ? "active" : ""}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="notification-box">
            <Bell className="icon" size={20} />
          </div>
          <div className="profile-box" onClick={() => setUserWork(!userWork)}>
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.username || "Profile"}
                className="profile-img"
              />
            ) : (
              <div className="profile-icon">
                <User size={20} />
              </div>
            )}
            <AnimatePresence initial={false}>
              {userWork && (
                <motion.div
                  key="user-dropdown"
                  className="userwork"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/profile" onClick={() => setUserWork(false)}>
                    <User size={18} /> My Profile
                  </Link>

                  <Link to="/reviews" onClick={() => setUserWork(false)}>
                    <NotebookPen size={18} /> Reviews
                  </Link>

                  <button onClick={() => console.log("Logout clicked")}>
                    <LogOut size={18} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <nav>
              <ul>
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={
                        location.pathname === link.path ? "active" : ""
                      }
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
