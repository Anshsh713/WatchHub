import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  Search as SearchIcon,
  Film,
  Tv,
  Star,
  Calendar,
  Sparkles,
  Layers,
  Building,
  Key,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFranchise } from "../../../Context/FranchiseContext";
import VideoLoader from "../../Common/VideoLoader";
import "./Franchise.css";

export default function FranchiseDetails() {
  const [sortOpen, setSortOpen] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    currentFranchise,
    franchiseContent,
    loading,
    contentLoading,
    followingIds,
    fetchFranchiseDetails,
    fetchFranchiseContent,
    followFranchise,
    unfollowFranchise,
  } = useFranchise();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'movie', 'tv'
  const [sortBy, setSortBy] = useState("release"); // 'release', 'title', 'rating'
  const [imageErrors, setImageErrors] = useState({});
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchFranchiseDetails(slug);
      fetchFranchiseContent(slug);
    }
  }, [slug]);

  const isFollowing = currentFranchise
    ? followingIds.includes(currentFranchise._id || currentFranchise.id)
    : false;

  const handleToggleFollow = async () => {
    if (!currentFranchise) return;
    const id = currentFranchise._id || currentFranchise.id;
    try {
      if (isFollowing) {
        await unfollowFranchise(id);
      } else {
        await followFranchise(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Filter & sort franchise items
  const filteredContent = franchiseContent
    .filter((item) => {
      const title = item.title || item.name || "";
      const matchesSearch = title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const mediaType = item.media_type || (item.title ? "movie" : "tv");
      if (filterType === "movie") return mediaType === "movie";
      if (filterType === "tv") return mediaType === "tv";

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "release") {
        const dateA = a.release_date || a.first_air_date || "";
        const dateB = b.release_date || b.first_air_date || "";
        return dateB.localeCompare(dateA);
      }
      if (sortBy === "title") {
        const titleA = a.title || a.name || "";
        const titleB = b.title || b.name || "";
        return titleA.localeCompare(titleB);
      }
      if (sortBy === "rating") {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }
      return 0;
    });

  if (loading && !currentFranchise) {
    return (
      <div className="FranchiseSection">
        <VideoLoader />
      </div>
    );
  }

  if (!currentFranchise && !loading) {
    return (
      <div className="FranchiseSection flex flex-col items-center justify-center min-h-screen">
        <h2>Franchise Not Found</h2>
        <p className="text-muted mt-sm">
          The requested franchise slug standard was not found.
        </p>
        <button
          className="btn-primary mt-md flex items-center gap-sm"
          onClick={() => navigate("/explore/franchise")}
        >
          <ChevronLeft size={20} /> Back to Franchises
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="FranchiseSection franchise-detail-page">
      {/* Dynamic Detail Hero Header */}
      <div
        className="detail-hero"
        style={{
          backgroundImage: currentFranchise.banner
            ? `linear-gradient(to bottom, rgba(15,15,15,0.4) 0%, rgba(15,15,15,0.95) 100%), url(${currentFranchise.banner})`
            : undefined,
        }}
      >
        <button
          className="back-btn"
          onClick={() => navigate("/explore/franchise")}
        >
          <ChevronLeft size={24} /> Back to Franchises
        </button>

        <div className="detail-hero-content flex flex-col md:flex-row items-start justify-between gap-lg">
          <div className="info-main">
            {currentFranchise.logo && !logoError && (
              <img
                src={currentFranchise.logo}
                alt=""
                className="detail-logo"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="hero-right-actions">
              <h1 className="detail-title">{currentFranchise.name}</h1>
              <motion.button
                className={`follow-main-btn ${isFollowing ? "following" : ""}`}
                onClick={handleToggleFollow}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.82 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
              >
                <Heart
                  size={20}
                  fill={isFollowing ? "#fff" : "none"}
                  color="#fff"
                />
              </motion.button>
            </div>
            <p className="detail-description">{currentFranchise.description}</p>

            <div className="detail-meta flex items-center gap-md">
              <span className="followers-badge flex items-center gap-xs">
                <Flame size={14} fill="#e50914" color="#e50914" />
                {currentFranchise.followers || 0} Followers
              </span>

              <span className="content-count flex items-center gap-xs">
                <Film size={14} />
                {franchiseContent.length} Titles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Controls: Search within franchise, type tabs, sorting */}
      <div className="detail-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder={`Search titles in ${currentFranchise.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs flex gap-sm">
          <button
            className={`tab-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All Titles ({franchiseContent.length})
          </button>
          <button
            className={`tab-btn ${filterType === "movie" ? "active" : ""}`}
            onClick={() => setFilterType("movie")}
          >
            Movies
          </button>
          <button
            className={`tab-btn ${filterType === "tv" ? "active" : ""}`}
            onClick={() => setFilterType("tv")}
          >
            TV Series
          </button>
        </div>

        <div className="sort-selector">
          <div className="sort-dropdown">
            <button
              className="sort-dropdown-button"
              onClick={() => setSortOpen((prev) => !prev)}
              type="button"
            >
              {sortBy === "release" && "Latest Release"}
              {sortBy === "rating" && "Highest Rated"}
              {sortBy === "title" && "Title A-Z"}
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="sort-dropdown-menu"
                >
                  <li
                    className={sortBy === "release" ? "active" : ""}
                    onClick={() => {
                      setSortBy("release");
                      setSortOpen(false);
                    }}
                  >
                    Latest Release
                  </li>

                  <li
                    className={sortBy === "rating" ? "active" : ""}
                    onClick={() => {
                      setSortBy("rating");
                      setSortOpen(false);
                    }}
                  >
                    Highest Rated
                  </li>

                  <li
                    className={sortBy === "title" ? "active" : ""}
                    onClick={() => {
                      setSortBy("title");
                      setSortOpen(false);
                    }}
                  >
                    Title A-Z
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {contentLoading ? (
        <div className="content-loader-container">
          <VideoLoader />
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="empty-content glass-panel">
          <Film size={40} className="empty-icon" />
          <h3>No Titles Found</h3>
          <p>
            {searchQuery
              ? `No movies or series matching "${searchQuery}" inside this franchise.`
              : "Fetching titles or no items available for this franchise source."}
          </p>
        </div>
      ) : (
        <motion.div
          className="media-items-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredContent.map((item) => {
            const mediaType = item.media_type || (item.title ? "movie" : "tv");
            const title = item.title || item.name;
            const releaseDate = item.release_date || item.first_air_date || "";
            const year = releaseDate ? releaseDate.split("-")[0] : "";
            const posterPath = item.poster_path;
            const hasErr = imageErrors[item.id];

            return (
              <motion.div
                key={`${item.id}-${mediaType}`}
                variants={cardVariants}
              >
                <Link
                  to={`/media/${mediaType}/${item.id}`}
                  className="detail-media-card glass-panel"
                >
                  <div className="poster-container">
                    {!hasErr && posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                        alt={title}
                        loading="lazy"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <div className="poster-fallback flex flex-col items-center justify-center">
                        <Film size={36} />
                        <span className="fallback-title">{title}</span>
                      </div>
                    )}

                    <div className="poster-gradient" />

                    <div className="card-badge-top flex justify-between">
                      <span className={`media-tag ${mediaType}`}>
                        {mediaType === "movie" ? (
                          <Film size={10} />
                        ) : (
                          <Tv size={10} />
                        )}
                        {mediaType.toUpperCase()}
                      </span>
                      {item.vote_average > 0 && (
                        <span className="rating-tag flex items-center gap-xs">
                          <Star size={10} fill="#f1c40f" color="#f1c40f" />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="card-media-info">
                      <h4 className="title-text">{title}</h4>
                      {year && (
                        <span className="year-text flex items-center gap-xs">
                          <Calendar size={12} /> {year}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
