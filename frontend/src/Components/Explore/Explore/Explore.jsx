import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMedia } from "../../../Context/MediaContext";
import { ChevronLeft } from "lucide-react";
import VideoLoader from "../../Common/VideoLoader";
import { AnimatePresence, motion } from "framer-motion";
import Search from "../../Common/Search";
import FranchiseList from "../Franchise/FranchiseList";
import "./Explore.css";
import "../../Home/Home.css";

export default function Explore() {
  const params = useParams();
  const mediaType = params.type;
  const mediaId = params.id;
  const category =
    params.category || (mediaType === "explore" ? mediaId : undefined);
  const navigate = useNavigate();

  if (category === "franchise") {
    return <FranchiseList />;
  }
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setHasFetched(false);
  }, [mediaId, mediaType, category]);

  const {
    fetchMediaByGenre,
    fetchMediaByCountry,
    fetchMediaByLanguage,
    fetchExploreCategory,
    results,
    loading,
    loadingMore,
    page,
    fetchGenres,
    fetchCountries,
    fetchLanguages,
    typesofmedia,
  } = useMedia();

  useEffect(() => {
    if (loading) {
      setHasFetched(true);
    }
  }, [loading]);

  useEffect(() => {
    if (mediaType === "genres") {
      fetchGenres();
    } else if (mediaType === "countries") {
      fetchCountries();
    } else if (mediaType === "languages") {
      fetchLanguages();
    } else {
      return;
    }
  }, [mediaType]);

  useEffect(() => {
    if (!mediaId) return;

    if (mediaType === "genres") {
      fetchMediaByGenre(mediaId, 1);
    } else if (mediaType === "countries") {
      fetchMediaByCountry(mediaId, 1);
    } else if (mediaType === "languages") {
      fetchMediaByLanguage(mediaId, 1);
    } else {
      return;
    }
  }, [mediaId, mediaType]);

  useEffect(() => {
    if (category) {
      fetchExploreCategory(category, 1);
    }
  }, [category]);

  const currentDetails = typesofmedia?.find((item) => {
    if (mediaType === "genres") {
      return item.id?.toString() === mediaId?.toString();
    }

    if (mediaType === "countries") {
      return item.code?.toString() === mediaId?.toString();
    }

    if (mediaType === "languages") {
      return item.code?.toString() === mediaId?.toString();
    }

    return false;
  });

  const categoryNames = {
    family: "Family Friendly",
    awards: "Award Winning",
    anime: "Anime",
    gems: "Hidden Gems",
    franchise: "Franchise",
  };

  const displayName =
    currentDetails?.name ||
    (category
      ? categoryNames[category.toLowerCase()] ||
        category.charAt(0).toUpperCase() + category.slice(1)
      : "Explore");

  const handleLoadMore = () => {
    const nextPage = page + 1;

    if (mediaType === "genres") {
      fetchMediaByGenre(mediaId, nextPage);
    } else if (mediaType === "countries") {
      fetchMediaByCountry(mediaId, nextPage);
    } else if (mediaType === "languages") {
      fetchMediaByLanguage(mediaId, nextPage);
    } else if (category) {
      fetchExploreCategory(category, nextPage);
    }
  };

  const currentScope = {
    genreId: mediaType === "genres" ? mediaId : undefined,
    countryCode: mediaType === "countries" ? mediaId : undefined,
    languageCode: mediaType === "languages" ? mediaId : undefined,
    category: category ? category.toLowerCase() : undefined,
  };

  if (loading && results.length === 0) {
    return (
      <div className="Explore">
        <AnimatePresence>
          <VideoLoader />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="Explore">
      <div className="explore-header" onClick={() => navigate(-1)}>
        <ChevronLeft size={32} />
        <h2>Explore {displayName}</h2>
      </div>

      <div className="explore-search">
        <Search
          placeholder={`Search in ${displayName}...`}
          scope={currentScope}
        />
      </div>

      <div className="explore-grid">
        {results.length === 0
          ? hasFetched && (
              <div className="no-results">
                <h3>No Results Found</h3>
                <p>Try exploring another category or check back later.</p>
              </div>
            )
          : results.map((item) => (
              <ExploreCard
                key={`${item.media_type || "media"}-${item.id}`}
                item={item}
              />
            ))}
      </div>
      {results.length > 0 && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

const ExploreCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const mediaType = item.media_type || (item.title ? "movie" : "tv");
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? releaseDate.split("-")[0] : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
    >
      <Link to={`/media/${item.media_type || "movie"}/${item.id}`}>
        <div className="media-card">
          {!imageError && item.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
              alt={item.title || item.name}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="explore-poster-placeholder">
              <span className="placeholder-icon">🎬</span>
              <span className="placeholder-text">{item.title || item.name}</span>
            </div>
          )}

          {item.watchhub_rating && item.watchhub_rating.total > 0 && (
            <div
              className="watchhub-rating-pill"
              style={{
                "--rating-color": item.watchhub_rating.color || "#a855f7",
              }}
            >
              <span className="rating-dot-inner" />
              <span className="rating-text-expanded">
                {item.watchhub_rating.dominantPercent}%{" "}
                {item.watchhub_rating.dominantRating || "Perfection"}
              </span>
            </div>
          )}

          <div className="media-info">
            <h4>{item.title || item.name}</h4>
            <div className="media-meta">
              {year && <span>{year}</span>}
              {mediaType && (
                <span className="media-type-tag">
                  {mediaType === "movie"
                    ? "Movie"
                    : mediaType === "tv"
                      ? "Series"
                      : "Anime"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
