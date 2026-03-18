import React, { useState } from "react";
import "./Reply.css";
import { motion } from "framer-motion";
import { useMediaReviews } from "../../../Context/MediaReviewsContext";
import { CircleUser, ThumbsUp } from "lucide-react";

export default function Reply({ replies, closing }) {
  const [newReply, setNewReply] = useState("");
  const { addReply, toggleLikeReply } = useMediaReviews();

  const handlePostReply = () => {
    if (!newReply.trim()) return;
    addReply(replies._id, newReply);
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

  const nestedReplies = buildNestedReplies(replies.replies || []);

  return (
    <motion.div 
      className="reply-section" 
      onClick={() => closing(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="reply-container"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ 
          type: "spring", 
          damping: 25, 
          stiffness: 300 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="left-review">
          <div className="review-reply-header">
            <CircleUser size={40} />
            <div>
              <h3>{replies.User?.User_Name}</h3>
              <p>{new Date(replies.createdAt).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="review-text">{replies.comment}</div>
        </div>

        <div className="right-replies">
          <div className="replies-list">
            {nestedReplies.map((reply) => (
              <ReplyItem
                key={reply._id}
                reply={reply}
                reviewId={replies._id}
                addReply={addReply}
                toggleLikeReply={toggleLikeReply}
              />
            ))}
          </div>

          <div className="reply-input">
            <CircleUser size={35} />

            <input
              type="text"
              placeholder="Add a comment..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
            />

            <button onClick={handlePostReply}>Post</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ReplyItem = ({ reply, reviewId, addReply, toggleLikeReply }) => {
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
    <div className="reply-card">
      <CircleUser size={28} />

      <div className="reply-body">
        <div className="reply-top">
          <h4>{reply.user?.User_Name}</h4>
          <span>{new Date(reply.createdAt).toLocaleTimeString()}</span>
        </div>

        <p>{reply.comment}</p>

        <div className="reply-actions">
          <button onClick={() => toggleLikeReply(reviewId, reply._id)}>
            <ThumbsUp size={14} /> {reply.likesCount || 0}
          </button>

          <button
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

        {showReplyInput && (
          <div
            className="nested-input"
            style={{ marginTop: "10px", display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              placeholder={`Reply to ${reply.user?.User_Name || "User"}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                flex: 1,
                padding: "8px 12px",
                background: "#1a1a1a",
                border: "none",
                borderRadius: "20px",
                color: "white",
              }}
              autoFocus
            />
            <button
              onClick={handleReply}
              style={{
                padding: "6px 16px",
                background: "var(--color-accent, #e50914)",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
              }}
            >
              Post
            </button>
          </div>
        )}

        {reply.children && reply.children.length > 0 && (
          <button
            onClick={() => setShowChildren(!showChildren)}
            style={{
              background: "transparent",
              border: "none",
              color: "#1da1f2",
              fontSize: "12px",
              marginTop: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {showChildren
              ? "Hide Replies"
              : `View ${reply.children.length} Replies`}
          </button>
        )}

        {showChildren && (
          <div
            className="nested-replies"
            style={{
              marginTop: "12px",
              borderLeft: "1px solid #2a2a2a",
              paddingLeft: "15px",
            }}
          >
            {reply.children?.map((child) => (
              <ReplyItem
                key={child._id}
                reply={child}
                reviewId={reviewId}
                addReply={addReply}
                toggleLikeReply={toggleLikeReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
