import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Star,
  Clock,
  Eye,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
} from "lucide-react";
import { useWatchList } from "../../Context/WatchListContext";

const STATUS_CONFIG = {
  want_to_watch: { label: "Want to Watch", color: "#3b82f6", icon: Clock },
  watching: { label: "Watching", color: "#f59e0b", icon: Eye },
  completed: { label: "Completed", color: "#22c55e", icon: CheckCircle2 },
  on_hold: { label: "On Hold", color: "#8b5cf6", icon: PauseCircle },
  dropped: { label: "Dropped", color: "#ef4444", icon: XCircle },
};

export default function WatchListCard({ item, onOpenEditModal }) {
  const navigate = useNavigate();
  const { updateStatus, removeFromWatchlist } = useWatchList();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.want_to_watch;
  const StatusIcon = statusInfo.icon;
  const year = item.releaseDate ? item.releaseDate.split("-")[0] : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCardClick = () => {
    navigate(`/media/${item.mediaType}/${item.tmdbId}`);
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    setMenuOpen(false);
    await updateStatus(item.tmdbId, item.mediaType, newStatus);
  };

  const handleToggleWatched = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    const newStatus = item.status === "completed" ? "want_to_watch" : "completed";
    await updateStatus(item.tmdbId, item.mediaType, newStatus);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    await removeFromWatchlist(item.tmdbId, item.mediaType);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (onOpenEditModal) {
      onOpenEditModal(item);
    }
  };

  return (
    <motion.div
      className="watchlist-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
    >
      <div className="watchlist-poster-container">
        {!imageError && item.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
            alt={item.title}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="watchlist-poster-placeholder">
            <span>🎬</span>
            <p>{item.title}</p>
          </div>
        )}

        {/* Badges on poster */}
        <div className="watchlist-card-top-tags">
          <span className="media-type-tag">
            {item.mediaType === "movie"
              ? "Movie"
              : item.mediaType === "anime"
                ? "Anime"
                : "TV Series"}
          </span>

          <span
            className="watchlist-status-badge"
            style={{
              backgroundColor: `${statusInfo.color}22`,
              color: statusInfo.color,
              borderColor: `${statusInfo.color}44`,
            }}
          >
            <StatusIcon size={12} />
            {statusInfo.label}
          </span>
        </div>

        {/* Action Menu Trigger */}
        <div className="watchlist-card-menu-wrap" ref={menuRef}>
          <button
            className="watchlist-card-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="watchlist-dropdown-popover"
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="dropdown-section-title">Change Status</div>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const isCurrent = item.status === key;
                  return (
                    <button
                      key={key}
                      className={`dropdown-item ${isCurrent ? "current" : ""}`}
                      onClick={(e) => handleStatusChange(e, key)}
                    >
                      <Icon size={14} style={{ color: cfg.color }} />
                      <span>{cfg.label}</span>
                      {isCurrent && <Check size={14} className="check-icon" />}
                    </button>
                  );
                })}

                <div className="dropdown-divider" />

                <button className="dropdown-item" onClick={handleToggleWatched}>
                  {item.status === "completed" ? (
                    <>
                      <RotateCcw size={14} />
                      <span>Mark as Unwatched</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} style={{ color: "#22c55e" }} />
                      <span>Mark as Watched</span>
                    </>
                  )}
                </button>

                <button className="dropdown-item" onClick={handleEdit}>
                  <Edit3 size={14} />
                  <span>Rate & Notes</span>
                </button>

                <div className="dropdown-divider" />

                <button className="dropdown-item danger" onClick={handleRemove}>
                  <Trash2 size={14} />
                  <span>Remove from WatchList</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Info Gradient */}
        <div className="watchlist-card-overlay">
          <h4>{item.title}</h4>

          <div className="watchlist-card-meta">
            {year && <span>{year}</span>}

            {item.personalRating ? (
              <span className="personal-rating-chip" title={`Your Rating: ${item.personalRating}/10`}>
                <Star size={12} fill="#facc15" color="#facc15" />
                {item.personalRating}/10
              </span>
            ) : (
              <span className="unrated-chip" onClick={handleEdit}>
                <Star size={12} /> Rate
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
