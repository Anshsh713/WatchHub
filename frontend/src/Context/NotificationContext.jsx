import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import API from "../Services/Axios_api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { status: authStatus } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!authStatus) return;
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      let notifs = res.data.notifications || [];
      let unread = res.data.unreadCount || 0;

      // If user has zero notifications, seed sample welcome notifications
      if (notifs.length === 0) {
        try {
          const seedRes = await API.post("/notifications/test-seed");
          notifs = seedRes.data.notifications || [];
          unread = seedRes.data.unreadCount || 0;
        } catch (e) {
          // ignore seed error
        }
      }

      setNotifications(notifs);
      setUnreadCount(unread);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 45000); // 45s periodic check
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [authStatus, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all as read error:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      const wasUnread = notifications.find((n) => n._id === id && !n.read);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await API.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Clear all notifications error:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
