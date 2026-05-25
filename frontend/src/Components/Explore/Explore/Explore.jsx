import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMedia } from "../../../Context/MediaContext";
import { ChevronLeft } from "lucide-react";
import VideoLoader from "../../Common/VideoLoader";
import { AnimatePresence, motion } from "framer-motion";
import "./Explore.css";
import "../../Home/Home.css";

export default function Explore() {
  const { type: mediaType, id: mediaId } = useParams();
  const navigate = useNavigate();
  const {
    fetchMediaByGenre,
    fetchMediaByCountry,
    fetchMediaByLanguage,
    results,
    loading,
    page,
    fetchGenres,
    fetchCountries,
    fetchLanguages,
    typesofmedia,
  } = useMedia();

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

  const displayName = currentDetails?.name || "Explore";

  if (loading || results.length === 0) {
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
        <ChevronLeft size={32} /> <h2>Explore {displayName}</h2>
      </div>
      <motion.div
        className="explore-grid"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {results.map((item) => (
          <Link
            key={item.id}
            to={`/media/${item.media_type || "movie"}/${item.id}`}
          >
            <motion.div className="media-card" variants={itemVariants}>
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  loading="lazy"
                />
              ) : (
                <div className="media-placeholder">No Image</div>
              )}
              <div className="media-info">
                <h4>{item.title || item.name}</h4>
                {item.release_date || item.first_air_date ? (
                  <p>
                    {(item.release_date || item.first_air_date).split("-")[0]}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
