import React, { useState, useEffect, useRef } from "react";
import { Bookmark, Check, ChevronDown, Clock, Eye, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWatchList } from "../../Context/WatchListContext";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  { id: "want_to_watch", label: "Want to Watch", icon: Clock, color: "#3b82f6" },
  { id: "watching", label: "Watching", icon: Eye, color: "#f59e0b" },
  { id: "completed", label: "Completed", icon: CheckCircle2, color: "#22c55e" },
  { id: "on_hold", label: "On Hold", icon: PauseCircle, color: "#8b5cf6" },
  { id: "dropped", label: "Dropped", icon: XCircle, color: "#ef4444" },
];

export default function WatchListButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  className = "",
  size = "normal", // 'normal' | 'compact' | 'icon'
}) {
  const { status: authStatus } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const {
    getWatchlistItemData,
    isInWatchlist,
    addToWatchlist,
    updateStatus,
    removeFromWatchlist,
    fetchWatchlistItem,
  } = useWatchList();

  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const menuRef = useRef(null);

  const existingItem = getWatchlistItemData(mediaId, mediaType);
  const inList = Boolean(existingItem) || isInWatchlist(mediaId, mediaType);
  const currentStatus = existingItem?.status || "want_to_watch";

  useEffect(() => {
    if (authStatus && mediaId && mediaType && !existingItem) {
      fetchWatchlistItem(mediaId, mediaType);
    }
  }, [authStatus, mediaId, mediaType]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMainClick = async (e) => {
    e.stopPropagation();
    if (!authStatus) {
      navigate("/authpage");
      return;
    }

    if (inList) {
      setIsOpen(!isOpen);
    } else {
      try {
        setLoadingAction(true);
        await addToWatchlist({
          tmdbId: mediaId,
          mediaType,
          title,
          posterPath,
          backdropPath,
          releaseDate,
          status: "want_to_watch",
        });
      } catch (err) {
        console.error("Failed to add:", err);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleStatusSelect = async (e, newStatus) => {
    e.stopPropagation();
    if (!authStatus) return;

    try {
      setLoadingAction(true);
      if (inList) {
        await updateStatus(mediaId, mediaType, newStatus);
      } else {
        await addToWatchlist({
          tmdbId: mediaId,
          mediaType,
          title,
          posterPath,
          backdropPath,
          releaseDate,
          status: newStatus,
        });
      }
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (!authStatus) return;

    try {
      setLoadingAction(true);
      await removeFromWatchlist(mediaId, mediaType);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to remove:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const currentStatusObj = STATUS_OPTIONS.find((s) => s.id === currentStatus) || STATUS_OPTIONS[0];
  const CurrentIcon = currentStatusObj.icon;

  if (size === "icon") {
    return (
      <div className="watchlist-btn-wrapper" ref={menuRef}>
        <button
          className={`watchlist-icon-btn ${inList ? "active" : ""} ${className}`}
          onClick={handleMainClick}
          title={inList ? `In WatchList (${currentStatusObj.label})` : "Add to WatchList"}
          disabled={loadingAction}
        >
          <Bookmark size={18} fill={inList ? "currentColor" : "none"} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="watchlist-popover-menu"
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="popover-header">Set WatchList Status</div>
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = inList && currentStatus === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`popover-item ${isSelected ? "selected" : ""}`}
                    onClick={(e) => handleStatusSelect(e, opt.id)}
                  >
                    <Icon size={16} style={{ color: opt.color }} />
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} className="check-mark" />}
                  </button>
                );
              })}
              {inList && (
                <button className="popover-item remove" onClick={handleRemove}>
                  <XCircle size={16} />
                  <span>Remove from WatchList</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="watchlist-btn-wrapper" ref={menuRef}>
      <div className={`watchlist-btn-group ${inList ? "in-watchlist" : ""} ${className}`}>
        <button
          className="watchlist-primary-btn"
          onClick={handleMainClick}
          disabled={loadingAction}
        >
          {inList ? (
            <>
              <CurrentIcon size={16} style={{ color: currentStatusObj.color }} />
              <span>{currentStatusObj.label}</span>
            </>
          ) : (
            <>
              <Bookmark size={16} />
              <span>Add to WatchList</span>
            </>
          )}
        </button>

        {inList && (
          <button
            className="watchlist-dropdown-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            aria-label="Change status"
          >
            <ChevronDown size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="watchlist-popover-menu"
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popover-header">Set WatchList Status</div>
            {STATUS_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = inList && currentStatus === opt.id;
              return (
                <button
                  key={opt.id}
                  className={`popover-item ${isSelected ? "selected" : ""}`}
                  onClick={(e) => handleStatusSelect(e, opt.id)}
                >
                  <Icon size={16} style={{ color: opt.color }} />
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="check-mark" />}
                </button>
              );
            })}
            <div className="popover-divider" />
            <button className="popover-item remove" onClick={handleRemove}>
              <XCircle size={16} />
              <span>Remove from WatchList</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
