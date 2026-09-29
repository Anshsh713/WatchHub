import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Users,
  Globe,
  Film,
  Tv,
  Sparkles,
  Flame,
  Star,
  ThumbsUp,
  Heart,
  Layers,
  Sparkle,
} from "lucide-react";
import { motion } from "framer-motion";
import "./CollectionCard.css";

export default function CollectionCard({ collection }) {
  const navigate = useNavigate();
  const [coverError, setCoverError] = useState(false);

  if (!collection) return null;

  const {
    _id,
    slug,
    name,
    description,
    type = "mixed",
    visibility = "public",
    coverImage,
    items = [],
    stats = {},
    engagement = {},
    averageRating = 0,
    voteScore = 0,
    owner = {},
    createdAt,
    trendingScore = 0,
  } = collection;

  const destinationSlug = slug || _id;

  const handleClick = () => {
    navigate(`/collections/${destinationSlug}`);
  };

  // Determine Collage Posters (up to 4 items with posterPath)
  const collagePosters = items
    .filter((item) => item.posterPath)
    .slice(0, 4)
    .map((item) => `https://image.tmdb.org/t/p/w300${item.posterPath}`);

  // Auto-calculated badges
  const isNew =
    createdAt && (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 7;
  const isTopRated = averageRating >= 4.0 && (collection.ratingCount || 0) >= 3;
  const totalVotes = (engagement.upvotes || 0) + (engagement.downvotes || 0);
  const isMostVoted = voteScore >= 80 && totalVotes >= 5;
  const isPopular = (engagement.likes || 0) >= 10 || (engagement.followers || 0) >= 10;
  const isTrending = trendingScore > 5;

  const creatorName = owner?.User_Name || "Creator";

  return (
    <motion.div
      className="collection-card"
      onClick={handleClick}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Cover / Collage Header */}
      <div className="collection-card-cover">
        {coverImage && !coverError ? (
          <img
            src={coverImage}
            alt={name}
            className="collection-card-single-cover"
            loading="lazy"
            onError={() => setCoverError(true)}
          />
        ) : collagePosters.length >= 2 ? (
          <div className="collection-poster-collage">
            {collagePosters.map((url, i) => (
              <div key={i} className="collage-item">
                <img src={url} alt={`Cover item ${i}`} loading="lazy" />
              </div>
            ))}
            {/* If 2 or 3 posters, fill rest with subtle placeholders */}
            {Array.from({ length: Math.max(0, 4 - collagePosters.length) }).map((_, i) => (
              <div key={`ph-${i}`} className="collage-placeholder">
                <Film size={16} />
              </div>
            ))}
          </div>
        ) : (
          <div className="collection-cover-placeholder">
            <Layers size={32} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{name}</span>
          </div>
        )}

        <div className="collection-card-cover-overlay" />

        {/* Top Badges (Type & Visibility) */}
        <div className="card-top-badges">
          <span className={`collection-type-pill ${type}`}>{type}</span>

          <span className="collection-visibility-pill">
            {visibility === "private" && (
              <>
                <Lock size={11} /> Private
              </>
            )}
            {visibility === "friends" && (
              <>
                <Users size={11} /> Friends
              </>
            )}
            {visibility === "public" && (
              <>
                <Globe size={11} /> Public
              </>
            )}
          </span>
        </div>

        {/* Item Counter */}
        <div className="collection-item-counter">
          <Layers size={12} />
          <span>{stats.totalItems || items.length} items</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="collection-card-body">
        <div className="card-title-row">
          <h3 className="collection-card-title">{name}</h3>
        </div>

        <div className="card-creator-row">
          <div className="creator-avatar">{creatorName.charAt(0).toUpperCase()}</div>
          <span className="creator-name">by @{creatorName}</span>
        </div>

        {description ? (
          <p className="collection-card-desc">{description}</p>
        ) : (
          <p className="collection-card-desc" style={{ fontStyle: "italic", opacity: 0.6 }}>
            No description provided.
          </p>
        )}

        {/* Automatic Metric Badges */}
        <div className="collection-auto-badges">
          {isTrending && (
            <span className="auto-badge badge-trending">
              <Flame size={11} /> Trending
            </span>
          )}
          {isTopRated && (
            <span className="auto-badge badge-top-rated">
              <Star size={11} /> Top Rated
            </span>
          )}
          {isMostVoted && (
            <span className="auto-badge badge-most-voted">
              <ThumbsUp size={11} /> High Approval
            </span>
          )}
          {isPopular && (
            <span className="auto-badge badge-popular">
              <Sparkles size={11} /> Popular
            </span>
          )}
          {isNew && (
            <span className="auto-badge badge-new">
              <Sparkle size={11} /> New
            </span>
          )}
        </div>

        {/* Metrics Footer */}
        <div className="collection-card-metrics">
          <div className="metric-item rating" title="Average Community Rating (1-5)">
            <Star size={13} fill="#facc15" color="#facc15" />
            <span>{averageRating > 0 ? averageRating.toFixed(1) : "—"}</span>
          </div>

          <div className="metric-item votes" title="Good/Bad Vote Score">
            <ThumbsUp size={13} />
            <span>{totalVotes > 0 ? `${voteScore}%` : "—"}</span>
          </div>

          <div className="metric-item likes" title="Total Likes">
            <Heart size={13} fill={(engagement.likes || 0) > 0 ? "#f43f5e" : "none"} />
            <span>{engagement.likes || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
