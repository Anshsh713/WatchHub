import React from "react";

export const getWatchHubRating = (item) => {
  if (item?.watchhub_rating && item.watchhub_rating.total > 0) {
    return item.watchhub_rating;
  }
  return null;
};

export default function WatchHubRatingPill({ item }) {
  if (!item) return null;
  const rating = getWatchHubRating(item);
  if (!rating || !rating.total) return null;

  return (
    <div
      className="watchhub-rating-pill"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        "--rating-color": rating.color || "#a855f7",
      }}
    >
      <span className="rating-dot-inner" />
      <span className="rating-text-expanded">
        {rating.dominantPercent}% {rating.dominantRating || "Perfection"}
      </span>
    </div>
  );
}
