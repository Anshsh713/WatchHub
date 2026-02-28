import React, { useEffect } from "react";
import { useMediaReviews } from "../../Context/MediaReviewsContext";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CircleUser, User, ThumbsUp, MessageCircle } from "lucide-react";
import { useRef } from "react";
import "./MediaReviewa.css";

export default function MediaReviews({ mediaID, mediaType, writingReview }) {
  const { reviews, loading, error, fetchReviews, totalPages, currentPage } =
    useMediaReviews();
  const { user } = useSelector((state) => state.auth);
  const [selectedRating, setSelectedRating] = React.useState(null);
  const [limit, setLimit] = React.useState("");
  const reviewRef = useRef();
  const ratings = [
    { label: "Skip", value: "skip" },
    { label: "Timepass", value: "timepass" },
    { label: "Go for it", value: "goforit" },
    { label: "Perfection", value: "perfection" },
  ];

  useEffect(() => {
    if (mediaID) {
      fetchReviews(mediaID);
    }
  }, [mediaID]);

  useEffect(() => {
    if (!reviewRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages && !loading) {
          fetchReviews(mediaID, currentPage + 1);
        }
      },
      { threshold: 1 },
    );

    observer.observe(reviewRef.current);

    return () => {
      observer.disconnect();
    };
  }, [reviewRef, currentPage, totalPages, loading, mediaID]);

  {
    loading && reviews.length === 0 && (
      <p style={{ textAlign: "center" }}>Loading reviews...</p>
    );
  }
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
              <button>Post Review</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="reviews-list">
        {reviews.length === 0 && (
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
          const isLiked = review.likes?.includes(user?._id);

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
                    <h4>{review.User?.User_Name}</h4>
                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
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

              <div className="review-content">
                <p>
                  {review.comment.slice(0, 400)}
                  {review.comment.length > 400 ? " ...more" : ""}
                </p>
              </div>

              <div className="review-actions">
                <button
                  className={`action-btn ${isLiked ? "liked" : ""}`}
                  onClick={() => handleLike(review._id)}
                >
                  <ThumbsUp size={18} />
                  <span>{review.likes?.length || null}</span>
                </button>

                <button className="action-btn">
                  <MessageCircle size={18} />
                  <span>{review.replies?.length || null}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div ref={reviewRef} style={{ height: "20px" }} />
    </motion.div>
  );
}
