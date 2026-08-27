import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Eye,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Calendar,
  History,
  Star,
  Film,
  Tv,
  Sparkles,
  Layers,
  ArrowUpDown,
  Bell,
  X,
  RotateCcw,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useWatchList } from "../../Context/WatchListContext";
import WatchListStats from "./WatchListStats";
import WatchListCard from "./WatchListCard";
import EmptyWatchList from "./EmptyWatchList";
import VideoLoader from "../Common/VideoLoader";
import "./WatchList.css";

const SORT_OPTIONS = [
  { id: "recent", label: "Recently Added" },
  { id: "oldest", label: "Oldest Added" },
  { id: "title_asc", label: "Title (A - Z)" },
  { id: "title_desc", label: "Title (Z - A)" },
  { id: "release_date", label: "Release Date" },
  { id: "rating_high", label: "Highest Rating" },
  { id: "rating_low", label: "Lowest Rating" },
];

const MEDIA_TYPE_TABS = [
  { id: "all", label: "All Items", icon: Layers },
  { id: "movie", label: "Movies", icon: Film },
  { id: "tv", label: "TV Shows", icon: Tv },
  { id: "anime", label: "Anime", icon: Sparkles },
];

export default function WatchList() {
  const navigate = useNavigate();
  const {
    watchlist,
    stats,
    statusCounts,
    upcoming,
    history,
    loading,
    loadingUpcoming,
    loadingHistory,
    page,
    totalPages,
    totalCount,
    mediaType,
    statusFilter,
    searchQuery,
    sortOption,
    setMediaType,
    setStatusFilter,
    setSearchQuery,
    setSortOption,
    setPage,
    fetchWatchlist,
    fetchUpcoming,
    fetchHistory,
    updateRating,
    updateStatus,
    markAsUnwatched,
    clearHistory,
  } = useWatchList();

  // Local UI state
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [sortOpen, setSortOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editModalItem, setEditModalItem] = useState(null);
  const [modalRating, setModalRating] = useState(0);
  const [modalNotes, setModalNotes] = useState("");
  const [modalStatus, setModalStatus] = useState("want_to_watch");
  const [savingModal, setSavingModal] = useState(false);

  const sortRef = useRef(null);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPage(1);
        fetchWatchlist({ search: searchInput, page: 1 });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Click outside for sort dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    setPage(1);
    fetchWatchlist({ type, page: 1 });
  };

  const handleStatusSelect = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchWatchlist({ status, page: 1 });
  };

  const handleSortSelect = (sortId) => {
    setSortOption(sortId);
    setSortOpen(false);
    fetchWatchlist({ sort: sortId, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchWatchlist({ page: newPage });
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  // Open Edit Rating / Notes Modal
  const openEditModal = (item) => {
    setEditModalItem(item);
    setModalRating(item.personalRating || 0);
    setModalNotes(item.notes || "");
    setModalStatus(item.status || "want_to_watch");
  };

  const closeEditModal = () => {
    setEditModalItem(null);
  };

  const handleSaveModal = async () => {
    if (!editModalItem) return;
    try {
      setSavingModal(true);
      await updateRating(
        editModalItem.tmdbId,
        editModalItem.mediaType,
        modalRating > 0 ? modalRating : null,
        modalNotes,
      );
      if (modalStatus !== editModalItem.status) {
        await updateStatus(editModalItem.tmdbId, editModalItem.mediaType, modalStatus);
      }
      closeEditModal();
    } catch (err) {
      console.error("Save modal error:", err);
    } finally {
      setSavingModal(false);
    }
  };

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortOption)?.label || "Recently Added";

  return (
    <div className="watchlist-page">
      {/* 1. HERO & STATS HEADER */}
      <div className="watchlist-hero">
        <div className="watchlist-hero-content">
          <div className="watchlist-title-wrap">
            <span className="watchlist-badge">
              <Bookmark size={14} /> PERSONAL MEDIA TRACKER
            </span>
            <h1>My WatchList</h1>
            <p>
              Manage your queue, track your viewing status, rate what you've seen, and get release reminders.
            </p>
          </div>

          <div className="watchlist-hero-actions">
            <button
              className={`watchlist-history-btn ${historyOpen ? "active" : ""}`}
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              <History size={17} />
              <span>Watch History</span>
              {history.total > 0 && <span className="history-count-badge">{history.total}</span>}
            </button>
          </div>
        </div>

        {/* Status Count Pills Overview */}
        <WatchListStats
          statusCounts={statusCounts}
          activeStatus={statusFilter}
          onSelectStatus={handleStatusSelect}
        />
      </div>

      {/* 2. WATCH HISTORY DRAWER (Collapsible) */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            className="watch-history-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="history-panel-header">
              <div className="history-title-group">
                <History size={20} className="history-icon" />
                <h3>Recently Watched History</h3>
              </div>

              <div className="history-actions">
                {history.total > 0 && (
                  <button className="clear-history-btn" onClick={clearHistory}>
                    <Trash2 size={15} /> Clear All History
                  </button>
                )}
                <button className="close-history-btn" onClick={() => setHistoryOpen(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {loadingHistory ? (
              <div className="history-loading">Loading watch history...</div>
            ) : history.total === 0 ? (
              <div className="history-empty">
                <p>No completed or watched items in your history yet.</p>
              </div>
            ) : (
              <div className="history-groups">
                {/* Today */}
                {history.today.length > 0 && (
                  <div className="history-group">
                    <span className="history-group-tag">TODAY</span>
                    <div className="history-items-row">
                      {history.today.map((item) => (
                        <HistoryItemCard
                          key={item._id}
                          item={item}
                          onUnwatch={markAsUnwatched}
                          onNavigate={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {history.yesterday.length > 0 && (
                  <div className="history-group">
                    <span className="history-group-tag">YESTERDAY</span>
                    <div className="history-items-row">
                      {history.yesterday.map((item) => (
                        <HistoryItemCard
                          key={item._id}
                          item={item}
                          onUnwatch={markAsUnwatched}
                          onNavigate={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Older */}
                {history.older.length > 0 && (
                  <div className="history-group">
                    <span className="history-group-tag">PREVIOUSLY WATCHED</span>
                    <div className="history-items-row">
                      {history.older.map((item) => (
                        <HistoryItemCard
                          key={item._id}
                          item={item}
                          onUnwatch={markAsUnwatched}
                          onNavigate={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="watchlist-content-container">
        {/* 3. UPCOMING WATCHLIST SECTION (Connected to Discover) */}
        {upcoming.length > 0 && (
          <section className="upcoming-watchlist-section">
            <div className="section-header-row">
              <div className="section-title-wrap">
                <span className="section-icon-badge amber">
                  <Bell size={18} />
                </span>
                <div>
                  <h2>Upcoming in Your WatchList</h2>
                  <p>Saved titles scheduled to release soon — get ready for premiere day.</p>
                </div>
              </div>

              <Link to="/discover" className="discover-link-chip">
                Discover More Releases <Sparkles size={14} />
              </Link>
            </div>

            <div className="upcoming-watchlist-grid">
              {upcoming.slice(0, 6).map((item) => (
                <motion.div
                  key={`${item.mediaType}-${item.tmdbId}`}
                  className="upcoming-watchlist-card"
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/media/${item.mediaType}/${item.tmdbId}`)}
                >
                  <div className="upcoming-card-poster">
                    {item.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
                        alt={item.title}
                      />
                    ) : (
                      <div className="placeholder-poster" />
                    )}
                    <span className="upcoming-card-tag">{item.mediaType?.toUpperCase()}</span>
                  </div>

                  <div className="upcoming-card-info">
                    <h4>{item.title}</h4>
                    <div className="upcoming-release-badge">
                      <Calendar size={13} />
                      <span>{item.releaseStatus || "Release TBA"}</span>
                    </div>
                    {item.releaseDate && (
                      <span className="upcoming-exact-date">
                        {new Date(item.releaseDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* 4. CONTROLS & FILTER BAR */}
        <div className="watchlist-controls-bar">
          {/* Media Type Tabs */}
          <div className="watchlist-type-tabs">
            {MEDIA_TYPE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = mediaType === tab.id;
              return (
                <button
                  key={tab.id}
                  className={`type-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleMediaTypeChange(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="watchlist-filters-right">
            {/* Search Input */}
            <div className="watchlist-search-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search within your WatchList..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button className="clear-search-btn" onClick={() => setSearchInput("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="watchlist-sort-dropdown" ref={sortRef}>
              <button
                className="sort-dropdown-trigger"
                onClick={() => setSortOpen(!sortOpen)}
              >
                <ArrowUpDown size={15} />
                <span>{activeSortLabel}</span>
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    className="sort-dropdown-menu"
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="sort-menu-header">Sort By</div>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        className={`sort-menu-item ${sortOption === opt.id ? "active" : ""}`}
                        onClick={() => handleSortSelect(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 5. MAIN WATCHLIST GRID */}
        {loading ? (
          <div className="watchlist-loader-container">
            <VideoLoader />
          </div>
        ) : watchlist.length === 0 ? (
          <EmptyWatchList
            type={searchQuery ? "search" : statusFilter !== "all" ? statusFilter : "default"}
            searchQuery={searchQuery}
            onClearFilter={() => {
              setSearchInput("");
              setSearchQuery("");
              setStatusFilter("all");
              fetchWatchlist({ search: "", status: "all", page: 1 });
            }}
          />
        ) : (
          <>
            <div className="watchlist-grid">
              {watchlist.map((item) => (
                <WatchListCard
                  key={`${item.mediaType}-${item.tmdbId}`}
                  item={item}
                  onOpenEditModal={openEditModal}
                />
              ))}
            </div>

            {/* 6. PAGINATION */}
            {totalPages > 1 && (
              <div className="watchlist-pagination">
                <button
                  className="page-btn prev"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  <ChevronLeft size={18} /> Previous
                </button>

                <div className="page-indicator">
                  Page <span>{page}</span> of <span>{totalPages}</span> ({totalCount} total items)
                </div>

                <button
                  className="page-btn next"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 7. EDIT RATING & NOTES MODAL */}
      <AnimatePresence>
        {editModalItem && (
          <motion.div
            className="watchlist-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEditModal}
          >
            <motion.div
              className="watchlist-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Edit WatchList Entry</h3>
                <button className="modal-close-icon" onClick={closeEditModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-media-preview">
                {editModalItem.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${editModalItem.posterPath}`}
                    alt={editModalItem.title}
                  />
                ) : (
                  <div className="placeholder-poster" />
                )}
                <div>
                  <h4>{editModalItem.title}</h4>
                  <span className="modal-type-tag">
                    {editModalItem.mediaType?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status Select */}
              <div className="modal-field-group">
                <label>Status</label>
                <div className="modal-status-buttons">
                  {[
                    { id: "want_to_watch", label: "Want to Watch" },
                    { id: "watching", label: "Watching" },
                    { id: "completed", label: "Completed" },
                    { id: "on_hold", label: "On Hold" },
                    { id: "dropped", label: "Dropped" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`modal-status-btn ${modalStatus === s.id ? "active" : ""}`}
                      onClick={() => setModalStatus(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Rating (1-10 Stars) */}
              <div className="modal-field-group">
                <div className="rating-label-row">
                  <label>Your Personal Rating</label>
                  <span className="rating-score-display">
                    {modalRating > 0 ? `${modalRating} / 10 Stars` : "Unrated"}
                  </span>
                </div>

                <div className="stars-input-row">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      className={`star-btn ${starVal <= modalRating ? "filled" : ""}`}
                      onClick={() => setModalRating(modalRating === starVal ? 0 : starVal)}
                    >
                      <Star size={20} fill={starVal <= modalRating ? "#facc15" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Notes */}
              <div className="modal-field-group">
                <label>Personal Notes & Thoughts</label>
                <textarea
                  placeholder="Add private notes, reminders, season thoughts..."
                  value={modalNotes}
                  maxLength={1000}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={4}
                />
                <span className="char-counter">{modalNotes.length} / 1000</span>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel" onClick={closeEditModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSaveModal}
                  disabled={savingModal}
                >
                  {savingModal ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| HISTORY ITEM CARD
|--------------------------------------------------------------------------
*/
function HistoryItemCard({ item, onUnwatch, onNavigate }) {
  return (
    <div className="history-card" onClick={onNavigate}>
      <div className="history-card-poster">
        {item.posterPath ? (
          <img src={`https://image.tmdb.org/t/p/w200${item.posterPath}`} alt={item.title} />
        ) : (
          <div className="placeholder-poster" />
        )}
      </div>

      <div className="history-card-info">
        <h4>{item.title}</h4>
        <span className="history-card-type">{item.mediaType?.toUpperCase()}</span>
        <button
          className="history-unwatch-btn"
          onClick={(e) => {
            e.stopPropagation();
            onUnwatch(item.tmdbId, item.mediaType);
          }}
          title="Mark as unwatched"
        >
          <RotateCcw size={13} /> Unwatch
        </button>
      </div>
    </div>
  );
}
