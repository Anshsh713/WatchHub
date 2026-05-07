import React, { useEffect, useState } from "react";
import { useMediaReviews } from "../../Context/MediaReviewsContext";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleUser,
  User,
  ThumbsUp,
  MessageCircle,
  Ellipsis,
} from "lucide-react";
import { useRef } from "react";
import "./MediaReviewa.css";
import Reply from "./MediaReview_Reply/Reply";
import {
  formatRelativeTime,
  formatCompactNumber,
} from "../../utils/formatters";

export default function MediaReviews({
  mediaID,
  mediaType,
  writingReview,
  setWritingReview,
  sort,
  filter,
  showSpoiler,
}) {
  const {
    reviews,
    loading,
    creating,
    error,
    fetchReviews,
    CreateReview,
    toggleLike,
    totalPages,
    currentPage,
    fetchStats,
    repliesMap,
    fetchReplies,
  } = useMediaReviews();
  const { user } = useSelector((state) => state.auth);
  const [selectedRating, setSelectedRating] = React.useState(null);
  const [limit, setLimit] = React.useState("");
  const [isspoiler, setIsSpoiler] = React.useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = React.useState({});
  const [revealReply, setRevealReply] = React.useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const reviewRef = useRef();
  const ratings = [
    { label: "Skip", value: "skip" },
    { label: "Timepass", value: "timepass" },
    { label: "Go for it", value: "goforit" },
    { label: "Perfection", value: "perfection" },
  ];

  const toggleSpoiler = (id) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const CreatingReview = async () => {
    if (!selectedRating || !limit.trim()) return;

    await CreateReview({
      MediaID: mediaID,
      MediaType: mediaType,
      rating:
        selectedRating === "skip"
          ? "Skip it"
          : selectedRating === "timepass"
            ? "TimePass"
            : selectedRating === "goforit"
              ? "Go for it"
              : "Perfection",
      isSpoiler: isspoiler,
      comment: limit,
    });
    await fetchStats(mediaID);
    setLimit("");
    setSelectedRating(null);
    setWritingReview(false);
  };

  useEffect(() => {
    if (mediaID) {
      fetchReviews(mediaID, 1, sort, filter);
    }
  }, [mediaID, sort, filter]);

  useEffect(() => {
    if (!reviewRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          currentPage < totalPages &&
          !loading &&
          !isFetchingMore
        ) {
          setIsFetchingMore(true);

          fetchReviews(mediaID, currentPage + 1, sort, filter).finally(() =>
            setIsFetchingMore(false),
          );
        }
      },
      { threshold: 1 },
    );

    observer.observe(reviewRef.current);

    return () => observer.disconnect();
  }, [reviewRef, currentPage, totalPages, loading, mediaID, sort, filter]);

  if (error) return <p>Error loading reviews</p>;

  return (
    <motion.div layout className="Review-container">
      <AnimatePresence>
        {writingReview && (
          <motion.div
            layout
            className="writing-reviews"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="user-rating">
              <div className="user">
                <CircleUser size={24} />
                <span>{user ? user.User_Name : "Guest"}</span>
              </div>
              <div className="rating">
                {ratings.map((item) => (
                  <motion.button
                    key={item.value}
                    onClick={() => setSelectedRating(item.value)}
                    className="rating-btn"
                    style={{ position: "relative" }}
                  >
                    {selectedRating === item.value && (
                      <motion.div
                        layoutId="ratingHighlight"
                        className="rating-highlight"
                        style={{
                          background:
                            item.value === "skip"
                              ? "#ef4444"
                              : item.value === "timepass"
                                ? "#facc15"
                                : item.value === "goforit"
                                  ? "#22c55e"
                                  : "#8b5cf6",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      style={{
                        color: selectedRating === item.value ? "#000" : "#aaa",
                      }}
                    >
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="write-area">
              <textarea
                placeholder="Write your review here..."
                value={limit}
                maxLength={1000}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <div className="limit">{limit.length}/1000</div>
            <div className="posting">
              {limit.trim() !== "" && selectedRating && (
                <div className="spoiler-button">
                  <input
                    type="checkbox"
                    id="spoiler-checkbox"
                    checked={isspoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                  />
                  <label htmlFor="spoiler-checkbox">Mark as spoiler</label>
                </div>
              )}

              <button onClick={CreatingReview}>
                {creating ? "Posting..." : "Post Review"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="reviews-list" style={{ minHeight: "70vh" }}>
        {loading && reviews.length === 0 && (
          <div className="notfound">
            <p
              style={{ textAlign: "center", color: "#aaa", fontSize: "1.1rem" }}
            >
              Loading reviews...
            </p>
          </div>
        )}
        {!loading && reviews.length === 0 && (
          <div className="notfound">
            <video
              src="/notreviews.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "40%",
                height: "40%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        {reviews.map((review) => {
          const isLiked = review.isLiked;
          return (
            <motion.div
              key={review._id}
              layout
              className="review-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="review-header">
                <div className="user">
                  <CircleUser size={24} />
                  <div className="user-date">
                    <h4>{review.User?.User_Name || user?.User_Name}</h4>
                    <p>{formatRelativeTime(review.createdAt)}</p>
                  </div>
                </div>

                <span
                  className="rating-badge"
                  style={{
                    background:
                      review.rating === "Skip it"
                        ? "#ef4444"
                        : review.rating === "TimePass"
                          ? "#facc15"
                          : review.rating === "Go for it"
                            ? "#22c55e"
                            : "#8b5cf6",
                  }}
                >
                  {review.rating}
                </span>
              </div>

              <div
                className={`review-content${review.isSpoiler && !revealedSpoilers[review._id] && !showSpoiler ? " spoiler" : ""}`}
                onClick={() => {
                  if (showSpoiler) return;
                  if (review.isSpoiler) toggleSpoiler(review._id);
                }}
              >
                <p>
                  {review.comment.slice(0, 400)}
                  {review.comment.length > 400 ? " ...more" : ""}
                </p>
              </div>
              <div className="rev-section">
                <div className="review-actions">
                  <button
                    className={`action-btn ${isLiked ? "liked" : ""}`}
                    onClick={() => toggleLike(review._id)}
                  >
                    <ThumbsUp size={18} />
                    <span>{formatCompactNumber(review.likesCount || 0)}</span>
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => {
                      if (review.repliesCount > 0) {
                        if (revealReply === review._id) {
                          setRevealReply(null);
                        } else {
                          setRevealReply(review._id);
                          fetchReplies(review._id);
                        }
                      }
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>{formatCompactNumber(review.repliesCount || 0)}</span>
                  </button>
                </div>
                <div className="report">
                  <Ellipsis size={18} />
                </div>
              </div>

              {revealReply === review._id && (
                <Reply
                  review={review}
                  replies={repliesMap[review._id] || []}
                  closing={setRevealReply}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      <div ref={reviewRef} style={{ height: "20px" }} />
    </motion.div>
  );
}
