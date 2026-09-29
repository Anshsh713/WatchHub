import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Plus, Filter, MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import CollectionReviewCard from "./CollectionReviewCard";

export default function CollectionReviews({
  collectionId,
  reviews = [],
  totalReviews = 0,
  averageRating = 0,
  onAddReview,
  onUpdateReview,
  onDeleteReview,
  onVoteHelpful,
  onReportReview,
  loading = false,
  allowComments = true,
}) {
  const { status: authStatus, user: currentUser } = useSelector((state) => state.auth);

  const [sortOption, setSortOption] = useState("top");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const existingUserReview = currentUser
    ? reviews.find(
        (r) => r.user?._id === currentUser.id || r.user?._id === currentUser._id
      )
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!reviewText.trim()) {
      setFormError("Please enter your thoughts in the review.");
      return;
    }

    try {
      setSubmitting(true);
      await onAddReview(newRating, reviewText.trim());
      setReviewText("");
      setShowReviewForm(false);
    } catch (err) {
      setFormError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "top") return (b.rating || 0) - (a.rating || 0);
    if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortOption === "most_helpful")
      return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return 0;
  });

  return (
    <div className="collection-reviews-wrapper">
      {/* Reviews Summary Header */}
      <div className="collection-reviews-header">
        <div className="reviews-summary-left">
          <div className="rating-big-number">
            <span>{averageRating > 0 ? averageRating.toFixed(1) : "—"}</span>
            <div className="stars-display">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(averageRating) ? "#facc15" : "none"}
                  color="#facc15"
                />
              ))}
            </div>
          </div>
          <div className="reviews-count-meta">
            <h3>Community Reviews</h3>
            <p>{totalReviews} reviews from WatchHub curators</p>
          </div>
        </div>

        <div className="reviews-header-actions">
          {/* Sorting */}
          <div className="reviews-sort-select-wrap">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="reviews-sort-select"
            >
              <option value="top">Top Rated</option>
              <option value="most_helpful">Most Helpful</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* Write review toggle */}
          {allowComments && authStatus && !existingUserReview && (
            <button
              className="btn-write-review"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <Plus size={16} /> Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Review Submission Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmit} className="collection-review-form">
          <h4>Write Your Review</h4>
          {formError && <div className="form-error-banner">{formError}</div>}

          {/* Star Picker */}
          <div className="form-stars-picker">
            <label>Your Rating (1 to 5 Stars):</label>
            <div className="stars-interactive-row">
              {Array.from({ length: 5 }).map((_, i) => {
                const starVal = i + 1;
                return (
                  <Star
                    key={starVal}
                    size={26}
                    fill={starVal <= (hoverRating || newRating) ? "#facc15" : "none"}
                    color="#facc15"
                    className="interactive-star"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(starVal)}
                  />
                );
              })}
              <span className="rating-preview-text">{hoverRating || newRating} / 5</span>
            </div>
          </div>

          {/* Review text */}
          <div className="form-group">
            <textarea
              rows={4}
              placeholder="What did you think of this curation? How was the pacing, order, and selection of media?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          <div className="review-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowReviewForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Review"}
            </button>
          </div>
        </form>
      )}

      {/* Existing Review notification if user already reviewed */}
      {existingUserReview && (
        <div className="already-reviewed-banner">
          <span>You have reviewed this collection. You can edit your review below.</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-items-list">
        {loading ? (
          <div className="reviews-loading-spinner">Loading reviews...</div>
        ) : sortedReviews.length === 0 ? (
          <div className="empty-reviews-box">
            <MessageSquare size={36} />
            <p>No reviews yet for this collection.</p>
            {allowComments && authStatus && !existingUserReview && (
              <button
                className="btn-secondary-sm"
                onClick={() => setShowReviewForm(true)}
              >
                Be the first to review!
              </button>
            )}
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <CollectionReviewCard
              key={rev._id}
              review={rev}
              onVoteHelpful={onVoteHelpful}
              onEdit={onUpdateReview}
              onDelete={onDeleteReview}
              onReport={onReportReview}
            />
          ))
        )}
      </div>
    </div>
  );
}
