import React, { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Flag, Edit3, Trash2, Check, X } from "lucide-react";
import { useSelector } from "react-redux";

export default function CollectionReviewCard({
  review,
  onVoteHelpful,
  onEdit,
  onDelete,
  onReport,
}) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(review.reviewText || "");
  const [editRating, setEditRating] = useState(review.rating || 5);

  const isAuthor =
    currentUser &&
    (currentUser.id === review.user?._id || currentUser._id === review.user?._id);

  const authorName = review.user?.User_Name || "User";
  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleSaveEdit = async () => {
    if (onEdit && editText.trim()) {
      await onEdit(review._id, editRating, editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="collection-review-card">
      <div className="review-card-header">
        <div className="review-author-info">
          <div className="author-avatar">{authorName.charAt(0).toUpperCase()}</div>
          <div className="author-details">
            <span className="author-name">@{authorName}</span>
            <span className="review-date">
              {formattedDate} {review.isEdited && "(edited)"}
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="review-rating-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={15}
              fill={i < (isEditing ? editRating : review.rating) ? "#facc15" : "none"}
              color="#facc15"
              style={{ cursor: isEditing ? "pointer" : "default" }}
              onClick={() => isEditing && setEditRating(i + 1)}
            />
          ))}
        </div>
      </div>

      {/* Review Text Body */}
      {isEditing ? (
        <div className="review-edit-box">
          <textarea
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={2000}
          />
          <div className="review-edit-actions">
            <button
              type="button"
              className="btn-cancel-sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-save-sm"
              onClick={handleSaveEdit}
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <p className="review-body-text">{review.reviewText}</p>
      )}

      {/* Review Card Footer Actions */}
      <div className="review-card-footer">
        <div className="helpful-voting-group">
          <span className="helpful-prompt">Was this helpful?</span>
          <button
            type="button"
            className={`helpful-btn ${review.userVotedHelpful ? "active" : ""}`}
            onClick={() => onVoteHelpful && onVoteHelpful(review._id, "helpful")}
            title="Helpful"
          >
            <ThumbsUp size={14} />
            <span>{review.helpfulCount || 0}</span>
          </button>

          <button
            type="button"
            className={`helpful-btn ${review.userVotedUnhelpful ? "active" : ""}`}
            onClick={() => onVoteHelpful && onVoteHelpful(review._id, "unhelpful")}
            title="Not Helpful"
          >
            <ThumbsDown size={14} />
            <span>{review.unhelpfulCount || 0}</span>
          </button>
        </div>

        <div className="review-author-actions">
          {isAuthor ? (
            <>
              {!isEditing && (
                <button
                  type="button"
                  className="review-action-btn edit"
                  onClick={() => setIsEditing(true)}
                  title="Edit Review"
                >
                  <Edit3 size={14} /> Edit
                </button>
              )}
              <button
                type="button"
                className="review-action-btn delete"
                onClick={() => onDelete && onDelete(review._id)}
                title="Delete Review"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              className="review-action-btn report"
              onClick={() => onReport && onReport(review._id)}
              title="Report Inappropriate Review"
            >
              <Flag size={13} /> Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
