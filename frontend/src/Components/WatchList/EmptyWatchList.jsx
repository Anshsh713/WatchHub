import React from "react";
import { Film, Tv, Sparkles, Bookmark, Search, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function EmptyWatchList({ type = "default", searchQuery = "", onClearFilter }) {
  if (type === "search") {
    return (
      <div className="watchlist-empty-state">
        <div className="empty-icon-circle">
          <Search size={32} />
        </div>
        <h3>No titles found for "{searchQuery}"</h3>
        <p>Try checking your spelling or clear the search filter.</p>
        {onClearFilter && (
          <button className="empty-action-btn" onClick={onClearFilter}>
            Clear Search
          </button>
        )}
      </div>
    );
  }

  if (type === "completed") {
    return (
      <div className="watchlist-empty-state">
        <div className="empty-icon-circle">
          <CheckCircle2 size={32} />
        </div>
        <h3>You haven't completed anything yet.</h3>
        <p>Mark movies, shows, or anime as completed as you finish watching them.</p>
      </div>
    );
  }

  if (type === "upcoming") {
    return (
      <div className="watchlist-empty-state">
        <div className="empty-icon-circle">
          <Calendar size={32} />
        </div>
        <h3>No upcoming titles in your WatchList.</h3>
        <p>Discover future blockbusters, returning shows, and anime and add them to your watchlist.</p>
        <Link to="/discover" className="empty-action-btn">
          <Sparkles size={16} /> Explore Discover Hub
        </Link>
      </div>
    );
  }

  if (type === "watching") {
    return (
      <div className="watchlist-empty-state">
        <div className="empty-icon-circle">
          <Tv size={32} />
        </div>
        <h3>You're not currently watching anything.</h3>
        <p>Set a movie or TV show to "Watching" to track your active progress.</p>
      </div>
    );
  }

  return (
    <div className="watchlist-empty-state">
      <div className="empty-icon-circle">
        <Bookmark size={36} />
      </div>
      <h2>Your WatchList is empty</h2>
      <p>Save movies, shows, and anime you want to watch later and keep track of your progress.</p>

      <div className="empty-action-links">
        <Link to="/explore/genres" className="empty-nav-chip">
          <Film size={16} /> Explore Movies
        </Link>
        <Link to="/interface" className="empty-nav-chip">
          <Tv size={16} /> Explore Shows
        </Link>
        <Link to="/explore/anime" className="empty-nav-chip">
          <Sparkles size={16} /> Explore Anime
        </Link>
      </div>
    </div>
  );
}
