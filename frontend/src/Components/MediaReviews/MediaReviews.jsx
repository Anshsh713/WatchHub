import React, { useEffect } from "react";
import { useMediaReviews } from "../../Context/MediaReviewsContext";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CircleUser, User } from "lucide-react";
import "./MediaReviewa.css";

export default function MediaReviews({ mediaID, mediaType, writingReview }) {
  const { reviews, loading, error, fetchReviews } = useMediaReviews();
  const { user } = useSelector((state) => state.auth);
  const [selectedRating, setSelectedRating] = React.useState(null);
  const [limit, setLimit] = React.useState("");
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

  if (loading) return <p>Loading reviews...</p>;
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

      {reviews.map((review) => (
        <motion.div key={review._id} layout className="review-card">
          <h4>{review.User?.User_Name}</h4>
          <p>{review.comment}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
