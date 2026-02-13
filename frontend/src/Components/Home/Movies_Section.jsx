import React, { useEffect } from "react";
import { useMedia } from "../../Context/MediaContext";
import "./Home.css";

export default function Movies_Section() {
  const { media, loading, error, currentType, fetchMedia } = useMedia();

  useEffect(() => {
    const savedType = localStorage.getItem("mediaType") || "all";
    handleChange(savedType);
  }, []);

  const handleChange = (type) => {
    fetchMedia(type);

    let themeClass = "";

    if (type === "movie") themeClass = "theme-movie";
    else if (type === "tv") themeClass = "theme-tv";
    else if (type === "anime") themeClass = "theme-anime";
    else themeClass = "";

    document.body.className = themeClass;
    localStorage.setItem("mediaType", type);
  };

  return (
    <div className="Movie-Section">
      <div className="Main-filter">
        <button
          className={currentType === "all" ? "active" : ""}
          onClick={() => handleChange("all")}
        >
          All
        </button>

        <button
          className={currentType === "movie" ? "active" : ""}
          onClick={() => handleChange("movie")}
        >
          Movies
        </button>

        <button
          className={currentType === "tv" ? "active" : ""}
          onClick={() => handleChange("tv")}
        >
          TV Shows
        </button>

        <button
          className={currentType === "anime" ? "active" : ""}
          onClick={() => handleChange("anime")}
        >
          Anime
        </button>
      </div>

      <div className="Media">
        <div className="Media">
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}

          {!loading && media?.length === 0 && <p>No media found</p>}

          {media?.map((item) => (
            <div key={item.id} className="media-card">
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
              />
              <div className="media-info">
                <h4>{item.title || item.name}</h4>
                <p>⭐ {item.vote_average}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
