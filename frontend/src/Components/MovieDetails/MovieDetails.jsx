import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMedia } from "../../Context/MediaContext";
import { motion, AnimatePresence } from "framer-motion";
import "./MovieDetails.css";
import VideoLoader from "../Common/VideoLoader";
import { X, Dot } from "lucide-react";

export default function MediaDetail() {
  const { id, type } = useParams();
  const { fetchMediaDetails, mediaDetails, loading } = useMedia();
  const [video, setVideo] = useState(false);

  useEffect(() => {
    if (id && type) {
      fetchMediaDetails(id, type);
    }
  }, [id, type]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (video) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [video]);

  function formatDuration(minutes) {
    if (!minutes) return null;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  if (loading) {
    return (
      <div className="Main-box">
        <AnimatePresence>
          <VideoLoader />
        </AnimatePresence>
      </div>
    );
  }

  const media_details = {};

  if (!mediaDetails?.images) return null;

  return (
    <div className="Main-box">
      <div className="banner">
        <img
          onClick={() => setVideo(!video)}
          src={`https://image.tmdb.org/t/p/original${mediaDetails.images.backdrop}`}
          alt="Backdrop"
        />
        <div className="banner-overlay"></div>
      </div>
      <div className="main-content">
        <div className="media-image">
          <div className="image">
            <img
              src={`https://image.tmdb.org/t/p/original${mediaDetails.images.poster}`}
            />
          </div>
        </div>
        <div className="media-details">
          <div className="idea">
            {mediaDetails.type === "movie"
              ? "Movie"
              : mediaDetails.type === "tv"
                ? "Show"
                : mediaDetails.type === "anime"
                  ? "Anime"
                  : ""}
            <Dot size={30} />
            {mediaDetails.theatreStatus.releaseDate?.slice(0, 4)}
            <Dot size={30} />
            {formatDuration(mediaDetails.duration)}
          </div>
          <div className="media-idea">
            <div className="media-title"></div>
          </div>
        </div>
      </div>

      <div className="content">
        <pre>{JSON.stringify(mediaDetails, null, 2)}</pre>
      </div>
      <AnimatePresence>
        {video && mediaDetails.trailer && (
          <motion.div
            className="trailer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setVideo(false)}
          >
            <motion.div
              className="trailer-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={() => setVideo(false)}
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 50 }}
                className="close-btn"
              >
                <X size={30} />
              </motion.button>

              <iframe
                width="100%"
                height="600"
                src={
                  mediaDetails.trailer.replace("watch?v=", "embed/") +
                  "?autoplay=1&mute=1"
                }
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
