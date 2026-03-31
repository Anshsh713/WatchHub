import React, { useState } from "react";
import "./Reply.css";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaReviews } from "../../../Context/MediaReviewsContext";
import { CircleUser, ThumbsUp, MessageCircle, X } from "lucide-react";
import {
  formatRelativeTime,
  formatCompactNumber,
} from "../../../utils/formatters";

export default function Reply({ review, replies, closing }) {
  const [newReply, setNewReply] = useState("");
  const { addReply, toggleLikeReply } = useMediaReviews();

  const handlePostReply = () => {
    if (!newReply.trim()) return;
    addReply(review._id, newReply);
    setNewReply("");
  };

  const buildNestedReplies = (replies) => {
    const map = {};
    const roots = [];

    replies.forEach((r) => (map[r._id] = { ...r, children: [] }));

    replies.forEach((r) => {
      if (r.replyingTo) {
        map[r.replyingTo]?.children.push(map[r._id]);
      } else {
        roots.push(map[r._id]);
      }
    });

    return roots;
  };

  const nestedReplies = buildNestedReplies(replies || []);

  return (
    <motion.div
      className="reply-section"
      onClick={() => closing(false)}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="reply-container"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{
          type: "spring",
          damping: 28,
          stiffness: 300,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="left-review">
          <div className="review-reply-header">
            <CircleUser size={46} className="user-avatar" />
            <div>
              <h3>{review.User?.User_Name || review.user?.User_Name}</h3>
              <p>{formatRelativeTime(review.createdAt)}</p>
            </div>
          </div>

          <div className="review-text">{review.comment}</div>
        </div>

        <div className="right-replies">
          <div className="replies-header">
            <h4>
              Replies <span>({formatCompactNumber(replies?.length || 0)})</span>
            </h4>
          </div>
          <div className="replies-list">
            <AnimatePresence initial={false}>
              {nestedReplies.length > 0 ? (
                nestedReplies.map((reply) => (
                  <ReplyItem
                    key={reply._id}
                    reply={reply}
                    reviewId={review._id}
                    addReply={addReply}
                    toggleLikeReply={toggleLikeReply}
                  />
                ))
              ) : (
                <motion.div
                  className="no-replies"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MessageCircle size={40} opacity={0.3} />
                  <p>No replies yet. Be the first to reply!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="reply-input-wrapper">
            <div className="reply-input">
              <CircleUser size={35} className="current-user-avatar" />
              <input
                type="text"
                placeholder="Add a reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePostReply()}
              />
              <button
                onClick={handlePostReply}
                className={newReply.trim() ? "active" : ""}
                disabled={!newReply.trim()}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ReplyItem = ({
  reply,
  reviewId,
  addReply,
  toggleLikeReply,
  isNested = false,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [text, setText] = useState("");

  const handleReply = () => {
    if (!text.trim()) return;

    addReply(reviewId, text, reply._id);
    setText("");
    setShowReplyInput(false);
    setShowChildren(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`reply-card ${isNested ? "is-nested" : ""}`}
    >
      <CircleUser size={30} className="reply-avatar" />

      <div className="reply-body">
        <div className="reply-top">
          <h4>{reply.user?.User_Name || reply.User?.User_Name || "User"}</h4>
          <span>{formatRelativeTime(reply.createdAt)}</span>
        </div>

        <p className="reply-comment">{reply.comment}</p>

        <div className="reply-actions">
          <button
            className="action-btn like-btn"
            onClick={() => toggleLikeReply(reviewId, reply._id)}
          >
            <ThumbsUp size={14} className={reply.isLiked ? "liked" : ""} />
            <span>{formatCompactNumber(reply.likesCount || 0)}</span>
          </button>

          <button
            className={`action-btn reply-btn ${showReplyInput ? "active" : ""}`}
            onClick={() => {
              setShowReplyInput(!showReplyInput);
              if (!showReplyInput) {
                setText(
                  `@${reply.user?.User_Name || reply.User?.User_Name || ""} `,
                );
              } else {
                setText("");
              }
            }}
          >
            Reply
          </button>
        </div>

        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="nested-input-container"
            >
              <div className="nested-input">
                <input
                  type="text"
                  placeholder={`Reply to ${reply.user?.User_Name || "User"}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={!text.trim()}
                  className={text.trim() ? "active" : ""}
                >
                  Post
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {reply.children && reply.children.length > 0 && (
          <button
            className="toggle-replies-btn"
            onClick={() => setShowChildren(!showChildren)}
          >
            <span className="line"></span>
            {showChildren
              ? "Hide Replies"
              : `View ${reply.children.length} Repl${reply.children.length === 1 ? "y" : "ies"}`}
          </button>
        )}

        <AnimatePresence>
          {showChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="nested-replies"
            >
              {reply.children?.map((child) => (
                <ReplyItem
                  key={child._id}
                  reply={child}
                  reviewId={reviewId}
                  addReply={addReply}
                  toggleLikeReply={toggleLikeReply}
                  isNested={true}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
