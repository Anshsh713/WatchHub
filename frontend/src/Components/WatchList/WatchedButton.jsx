import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchList } from "../../Context/WatchListContext";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./WatchedButton.css";

const MotionButton = motion.button;

export default function WatchedButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  className = "",
}) {
  const { status: authStatus } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const { addToWatchlist, updateStatus, fetchWatchlistItem } = useWatchList();
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;

    const syncCompletedState = async () => {
      if (!authStatus || !mediaId || !mediaType) {
        if (active) setCompleted(false);
        return;
      }

      const existingItem = await fetchWatchlistItem(mediaId, mediaType);
      if (active) {
        setCompleted(existingItem?.status === "completed");
      }
    };

    syncCompletedState();

    return () => {
      active = false;
    };
  }, [authStatus, mediaId, mediaType, fetchWatchlistItem]);

  const handleCheck = async (e) => {
    e.stopPropagation();

    if (!authStatus) {
      navigate("/authpage");
      return;
    }

    try {
      setLoading(true);

      const existingItem = await fetchWatchlistItem(mediaId, mediaType);

      if (completed) {
        if (existingItem) {
          await updateStatus(mediaId, mediaType, "want_to_watch");
        }
        setCompleted(false);
      } else {
        if (existingItem) {
          await updateStatus(mediaId, mediaType, "completed");
        } else {
          await addToWatchlist({
            tmdbId: mediaId,
            mediaType,
            title,
            posterPath,
            backdropPath,
            releaseDate,
            status: "completed",
          });
        }
        setCompleted(true);
      }
    } catch (error) {
      console.error("Failed to update watched status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionButton
      type="button"
      className={`already-watched-btn ${completed ? "completed" : ""} ${className}`}
      onClick={handleCheck}
      disabled={loading}
      title={completed ? "Mark as Unwatched" : "Mark as Already Watched"}
      aria-label={completed ? "Mark as Unwatched" : "Mark as Already Watched"}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Check size={18} />
    </MotionButton>
  );
}
