import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMedia } from "../../Context/MediaContext";
import "./Search.css";

export default function Search({
  placeholder = "Search movies, shows, anime...",
  scopedResults,
  scope,
}) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { searchMedia, searchResults = [] } = useMedia();

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const displayedResults = Array.isArray(scopedResults)
    ? scopedResults.filter((item) =>
        (item.title || item.name || "")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      )
    : searchResults;

  const scopeKey = scope ? JSON.stringify(scope) : "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        if (!Array.isArray(scopedResults)) {
          searchMedia(query, scope);
        }
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchMedia, scopedResults, scopeKey]);

  const handleSelect = (item) => {
    const mediaType = item.media_type || (item.title ? "movie" : "tv");
    navigate(`/media/${mediaType}/${item.id}`);

    setQuery("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <SearchIcon size={20} className="search-icon" />

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setShowResults(true);
          }}
          className="search-input"
        />

        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            className="search-results"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {displayedResults.length > 0 ? (
              displayedResults.map((item, index) => (
                <motion.div
                  key={`${item.media_type || "item"}-${item.id}`}
                  className="search-result-item"
                  onClick={() => handleSelect(item)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.18,
                    delay: Math.min(index * 0.03, 0.18),
                  }}
                  whileHover={{
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    x: 3,
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                      alt={item.title || item.name}
                      className="search-result-poster"
                    />
                  ) : (
                    <div className="search-result-placeholder">🎬</div>
                  )}

                  <div className="search-result-info">
                    <h4>{item.title || item.name}</h4>

                    <p>
                      {item.media_type === "movie"
                        ? "Movie"
                        : item.media_type === "tv"
                          ? "TV Show"
                          : item.media_type}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              query.trim() && (
                <motion.div
                  className="search-no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  No results found
                </motion.div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
