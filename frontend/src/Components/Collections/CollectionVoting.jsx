import React from "react";
import { ThumbsUp, ThumbsDown, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CollectionVoting({
  upvotes = 0,
  downvotes = 0,
  voteScore = 0,
  currentVote = null, // 'up' | 'down' | null
  onVote,
  disabled = false,
}) {
  const totalVotes = upvotes + downvotes;
  const upRatio = totalVotes > 0 ? ((upvotes / totalVotes) * 100).toFixed(0) : 0;
  const downRatio = totalVotes > 0 ? ((downvotes / totalVotes) * 100).toFixed(0) : 0;

  return (
    <div className="collection-voting-widget">
      <div className="voting-score-header">
        <div className="score-badge">
          <span className="score-percentage">
            {totalVotes > 0 ? `${voteScore}%` : "No votes"}
          </span>
          <span className="score-label">Community Approval</span>
        </div>

        <div className="voting-action-buttons">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`vote-btn upvote ${currentVote === "up" ? "active" : ""}`}
            onClick={() => onVote && onVote("up")}
            disabled={disabled}
            title="Vote Good (Thumbs Up)"
          >
            <ThumbsUp size={16} />
            <span className="vote-count">{upvotes}</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`vote-btn downvote ${currentVote === "down" ? "active" : ""}`}
            onClick={() => onVote && onVote("down")}
            disabled={disabled}
            title="Vote Bad (Thumbs Down)"
          >
            <ThumbsDown size={16} />
            <span className="vote-count">{downvotes}</span>
          </motion.button>
        </div>
      </div>

      {/* Visual Vote Progress Bar */}
      {totalVotes > 0 && (
        <div className="vote-ratio-bar">
          <div
            className="ratio-fill-up"
            style={{ width: `${upRatio}%` }}
            title={`${upRatio}% Upvotes (${upvotes})`}
          />
          <div
            className="ratio-fill-down"
            style={{ width: `${downRatio}%` }}
            title={`${downRatio}% Downvotes (${downvotes})`}
          />
        </div>
      )}
    </div>
  );
}
