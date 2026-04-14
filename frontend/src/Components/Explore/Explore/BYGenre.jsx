import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMedia } from "../../../Context/MediaContext";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import VideoLoader from "../../Common/VideoLoader";
import "./BYGenre.css";

export default function BYGenre() {
  const { genre: genreId } = useParams();
  const navigate = useNavigate();
  const {
    fetchMediaByGenre,
    results,
    loading,
    page,
    fetchGenres,
    typesofmedia,
  } = useMedia();

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (genreId) {
      fetchMediaByGenre(genreId, 1);
    }
  }, [genreId]);

  const genreDetails = typesofmedia?.find(
    (g) => g.id?.toString() === genreId?.toString(),
  );
  const genreName = genreDetails ? genreDetails.name : "Genre";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="bygenre-container">
      <div className="bygenre-header">
        <ChevronLeft
          className="back-icon"
          onClick={() => navigate("/interface")}
        />
        <h2 className="bygenre-title">{genreName} Results</h2>
      </div>

      {loading && page === 1 ? (
        <VideoLoader />
      ) : results?.length > 0 ? (
        <>
          <motion.div
            className="bygenre-grid"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {results.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                className="media-card"
                variants={itemVariants}
                onClick={() =>
                  navigate(`/media/${item.media_type || "movie"}/${item.id}`)
                }
              >
                <div className="media-poster-container">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      className="media-poster"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="media-poster"
                      style={{ background: "#222" }}
                    />
                  )}
                </div>
                <div className="media-info">
                  <p className="media-title">{item.title || item.name}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => fetchMediaByGenre(genreId, page + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">No results found for this genre.</div>
      )}
    </div>
  );
}
