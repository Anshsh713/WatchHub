import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMedia } from "../../../Context/MediaContext";
import { ChevronLeft } from "lucide-react";
import VideoLoader from "../../Common/VideoLoader";
import { AnimatePresence, motion } from "framer-motion";
import Search from "../../Common/Search";
import "./Explore.css";
import "../../Home/Home.css";

export default function Explore() {
  const params = useParams();
  const mediaType = params.type;
  const mediaId = params.id;
  const category =
    params.category || (mediaType === "explore" ? mediaId : undefined);
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="Explore">
        <AnimatePresence>
          <VideoLoader />
        </AnimatePresence>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "tween", duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="Explore">
      <div className="explore-header" onClick={() => navigate(-1)}>
        <ChevronLeft size={32} />
        <h2>Explore {displayName}</h2>
      </div>

      <div className="explore-search">
        <Search placeholder="Search..." />
      </div>

      <motion.div
        className="explore-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {results.length === 0
          ? hasFetched && (
              <div className="no-results">
                <h3>No Results Found</h3>
                <p>Try exploring another category or check back later.</p>
              </div>
            )
          : results.map((item) => (
              <ExploreCard
                key={item.id}
                item={item}
                itemVariants={itemVariants}
              />
            ))}
      </motion.div>
      {results.length > 0 && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

const ExploreCard = ({ item, itemVariants }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link to={`/media/${item.media_type || "movie"}/${item.id}`}>
      <motion.div className="media-card" variants={itemVariants}>
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

        <div className="media-info">
          <h4>{item.title || item.name}</h4>

          {(item.release_date || item.first_air_date) && (
            <p>{(item.release_date || item.first_air_date).split("-")[0]}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};
