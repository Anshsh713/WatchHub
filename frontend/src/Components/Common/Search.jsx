import React, { useState, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMedia } from "../../Context/MediaContext";
import "./Search.css";

export default function Search({
  placeholder = "Search movies, shows, anime...",
}) {
  const navigate = useNavigate();

  const { searchMedia, searchResults = [] } = useMedia();

  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        searchMedia(query);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchMedia]);

  const handleSelect = (item) => {
    navigate(`/media/${item.media_type}/${item.id}`);

    setQuery("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <SearchIcon size={20} className="search-icon" />

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />

        {query && (
          <button className="search-clear-btn" onClick={clearSearch}>
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results">
          {searchResults.length > 0
            ? searchResults.map((item) => (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="search-result-item"
                  onClick={() => handleSelect(item)}
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
                </div>
              ))
            : query.trim() && (
                <div className="search-no-results">No results found</div>
              )}
        </div>
      )}
    </div>
  );
}
