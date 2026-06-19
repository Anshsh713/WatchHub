import React, { useState } from "react";
import "./NewsCommentReply.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNewsComments } from "../../../../Context/News_CommentsConstext";
import { CircleUser, ThumbsUp, MessageCircle } from "lucide-react";
import {
  formatRelativeTime,
  formatCompactNumber,
} from "../../../../utils/formatters";

export default function NewsCommentReply({ comment, replies, closing }) {
  const [newReply, setNewReply] = useState("");
  const { addReply, toggleLikeReply } = useNewsComments();

  const handlePostReply = () => {
    if (!newReply.trim()) return;
    addReply(comment._id, newReply);
    setNewReply("");
  };

  /* Build nested tree */
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
      className="ncr-section"
      onClick={() => closing(null)}
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="ncr-container"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: original comment ── */}
        <div className="ncr-left">
          <div className="ncr-comment-header">
            <CircleUser size={46} className="ncr-avatar" />
            <div>
              <h3>{comment.User?.User_Name || comment.user?.User_Name}</h3>
              <p>{formatRelativeTime(comment.createdAt)}</p>
            </div>
          </div>
          <div className="ncr-comment-text">{comment.comment}</div>
        </div>

        {/* ── Right: replies ── */}
        <div className="ncr-right">
          <div className="ncr-replies-header">
            <h4>
              Replies <span>({formatCompactNumber(replies?.length || 0)})</span>
            </h4>
          </div>

          <div className="ncr-replies-list">
            <AnimatePresence initial={false}>
              {nestedReplies.length > 0 ? (
                nestedReplies.map((reply) => (
                  <ReplyItem
                    key={reply._id}
                    reply={reply}
                    commentId={comment._id}
                    addReply={addReply}
                    toggleLikeReply={toggleLikeReply}
                  />
                ))
              ) : (
                <motion.div
                  className="ncr-no-replies"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MessageCircle size={40} opacity={0.3} />
                  <p>No replies yet. Be the first!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Reply input ── */}
          <div className="ncr-input-wrapper">
            <div className="ncr-input">
              <CircleUser size={35} className="ncr-input-avatar" />
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

/* ─────── Reply item (recursive) ─────── */
const ReplyItem = ({
  reply,
  commentId,
  addReply,
  toggleLikeReply,
  isNested = false,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [text, setText] = useState("");

  const handleReply = () => {
    if (!text.trim()) return;
    addReply(commentId, text, reply._id);
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
      className={`ncr-reply-card ${isNested ? "is-nested" : ""}`}
    >
      <CircleUser size={30} className="ncr-reply-avatar" />

      <div className="ncr-reply-body">
        <div className="ncr-reply-top">
          <h4>{reply.user?.User_Name || reply.User?.User_Name || "User"}</h4>
          <span>{formatRelativeTime(reply.createdAt)}</span>
        </div>

        <p className="ncr-reply-comment">{reply.comment}</p>

        <div className="ncr-reply-actions">
          <button
            className="ncr-action-btn like-btn"
            onClick={() => toggleLikeReply(commentId, reply._id)}
          >
            <ThumbsUp size={14} className={reply.isLiked ? "liked" : ""} />
            <span>{formatCompactNumber(reply.likesCount || 0)}</span>
          </button>

          <button
            className={`ncr-action-btn reply-btn ${showReplyInput ? "active" : ""}`}
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
              className="ncr-nested-input-container"
            >
              <div className="ncr-nested-input">
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
            className="ncr-toggle-btn"
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
              className="ncr-nested-replies"
            >
              {reply.children?.map((child) => (
                <ReplyItem
                  key={child._id}
                  reply={child}
                  commentId={commentId}
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
