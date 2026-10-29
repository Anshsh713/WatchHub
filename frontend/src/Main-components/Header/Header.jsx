import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  Menu,
  X,
  NotebookPen,
  LogOut,
  Users,
  Settings as SettingsIcon,
  Clock,
  Heart,
  MessageSquare,
  Sparkles,
  Check,
  Trash2,
  Ticket,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import "./Header.css";
import { useMedia } from "../../Context/MediaContext";
import { useAuth } from "../../Context/UserContext";
import { useNotifications } from "../../Context/NotificationContext";

export default function Header() {
  const { currentType } = useMedia();
  const { user } = useSelector((state) => state.auth);
  const { logoutUser } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userWork, setUserWork] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all"); // "all" | "unread"

  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  let themeClass = "";
  if (currentType === "movie") themeClass = "theme-movie";
  else if (currentType === "tv") themeClass = "theme-tv";
  else if (currentType === "anime") themeClass = "theme-anime";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-box")) {
        setUserWork(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Discover", path: "/discover" },
    { name: "Store", path: "/marketplace" },
    { name: "Insider", path: "/insider" },
    { name: "Community", path: "/community" },
    { name: "Collections", path: "/collections" },
    { name: "WatchList", path: "/watchlist" },
    { name: "Explore", path: "/interface" },
  ];

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif._id);
    }
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const filteredNotifications =
    notifFilter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

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

          {/* Notification Bell & Dropdown */}
          <div className="notification-box" ref={notifRef}>
            <div
              style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}
              onClick={() => setIsNotifOpen(!isNotifOpen)}
            >
              <Bell className="icon" size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  className="notifications-popover"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notifications-header">
                    <h3>Notifications</h3>
                    <div className="notifications-actions-bar">
                      {unreadCount > 0 && (
                        <button
                          className="btn-notif-action"
                          onClick={() => markAllAsRead()}
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          className="btn-notif-action"
                          onClick={() => clearAllNotifications()}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="notifications-tabs">
                    <button
                      className={`notif-tab-btn ${notifFilter === "all" ? "active" : ""}`}
                      onClick={() => setNotifFilter("all")}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      className={`notif-tab-btn ${notifFilter === "unread" ? "active" : ""}`}
                      onClick={() => setNotifFilter("unread")}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  <div className="notifications-list">
                    {filteredNotifications.length === 0 ? (
                      <div className="notifications-empty">
                        <Bell size={28} style={{ marginBottom: "8px", opacity: 0.5 }} />
                        <p>No {notifFilter === "unread" ? "unread " : ""}notifications</p>
                      </div>
                    ) : (
                      filteredNotifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notification-item ${!n.read ? "unread" : ""}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-icon-circle">
                            {n.type === "follow" ? (
                              <Users size={16} />
                            ) : n.type === "club_post" || n.type === "club_comment" ? (
                              <MessageSquare size={16} />
                            ) : n.type === "review_like" ? (
                              <Heart size={16} />
                            ) : (
                              <Sparkles size={16} />
                            )}
                          </div>

                          <div className="notif-content">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-message">{n.message}</div>
                            <span className="notif-time">
                              {new Date(n.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {!n.read && <div className="notif-unread-dot" />}

                          <button
                            className="btn-delete-notif"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n._id);
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="profile-box" onClick={() => setUserWork(!userWork)}>
            {user?.avatar || user?.profilePicture ? (
              <img
                src={user.avatar || user.profilePicture}
                alt={user.User_Name || user.username || "Profile"}
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
                  style={{ width: "200px" }}
                >
                  <Link to="/profile" onClick={() => setUserWork(false)}>
                    <User size={18} /> My Profile
                  </Link>

                  <Link to="/community" onClick={() => setUserWork(false)}>
                    <Users size={18} /> Community & Clubs
                  </Link>

                  <Link to="/watchlist" onClick={() => setUserWork(false)}>
                    <Clock size={18} /> My WatchList
                  </Link>

                  <Link to="/bookings" onClick={() => setUserWork(false)}>
                    <Ticket size={18} /> Cinema Tickets
                  </Link>

                  <Link to="/marketplace" onClick={() => setUserWork(false)}>
                    <ShoppingBag size={18} /> Merch Store
                  </Link>

                  <Link to="/settings" onClick={() => setUserWork(false)}>
                    <SettingsIcon size={18} /> Settings
                  </Link>

                  <button
                    onClick={() => {
                      setUserWork(false);
                      logoutUser();
                      navigate("/authpage");
                    }}
                  >
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
                <li>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
