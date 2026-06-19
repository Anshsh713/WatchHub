import React, { useEffect, useState, useRef } from "react";
import { useNewsComments } from "../../../Context/News_CommentsConstext";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { CircleUser, ThumbsUp, MessageCircle, Ellipsis, Trash2 } from "lucide-react";
import "./NewsComments.css";
import NewsCommentReply from "./NewsComment_Reply/NewsCommentReply";
import {
  formatRelativeTime,
  formatCompactNumber,
} from "../../../utils/formatters";

export default function NewsComments({
  newsId,
  writingComment,
  setWritingComment,
  sort,
  filter,
}) {
  const {
    comments,
    loading,
    creating,
    error,
    fetchComments,
    createComment,
    toggleLike,
    deleteComment,
    totalPages,
    currentPage,
    repliesMap,
    fetchReplies,
  } = useNewsComments();

  const { user } = useSelector((state) => state.auth);
  const [commentText, setCommentText] = useState("");
  const [revealReply, setRevealReply] = useState(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const bottomRef = useRef();

  /* ── fetch on mount / filter change ── */
  useEffect(() => {
    if (newsId) {
      fetchComments(newsId, 1, sort, filter);
    }
  }, [newsId, sort, filter]);

  /* ── infinite scroll sentinel ── */
  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          currentPage < totalPages &&
          !loading &&
          !isFetchingMore
        ) {
          setIsFetchingMore(true);
          fetchComments(newsId, currentPage + 1, sort, filter).finally(() =>
            setIsFetchingMore(false),
          );
        }
      },
      { threshold: 1 },
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [bottomRef, currentPage, totalPages, loading, newsId, sort, filter]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    await createComment(newsId, commentText);
    setCommentText("");
    setWritingComment(false);
  };

  if (error) return <p style={{ color: "#aaa", padding: "20px" }}>Error loading comments</p>;

  return (
    <motion.div layout className="nc-container">
      {/* ── Write comment box ── */}
      <AnimatePresence>
        {writingComment && (
          <motion.div
            layout
            className="nc-write-box"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="nc-write-user">
              <CircleUser size={24} />
              <span>{user ? user.User_Name : "Guest"}</span>
            </div>
            <div className="nc-write-area">
              <textarea
                placeholder="Share your thoughts on this story..."
                value={commentText}
                maxLength={1000}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <div className="nc-write-footer">
              <span className="nc-char-limit">{commentText.length}/1000</span>
              <button
                className="nc-post-btn"
                onClick={handlePostComment}
                disabled={!commentText.trim()}
              >
                {creating ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Comments list ── */}
      <div className="nc-list" style={{ minHeight: "50vh" }}>
        {loading && comments.length === 0 && (
          <div className="nc-empty">
            <p>Loading comments...</p>
          </div>
        )}
        {!loading && comments.length === 0 && (
          <div className="nc-empty">
            <MessageCircle size={48} opacity={0.25} />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}

        {comments.map((comment) => (
          <motion.div
            key={comment._id}
            layout
            className="nc-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* header */}
            <div className="nc-card-header">
              <div className="nc-user">
                <CircleUser size={24} />
                <div className="nc-user-meta">
                  <h4>{comment.User?.User_Name || user?.User_Name}</h4>
                  <p>{formatRelativeTime(comment.createdAt)}</p>
                </div>
              </div>

              {/* 3-dot menu (only for own comments) */}
              {user && comment.User?._id?.toString() === user._id?.toString() && (
                <div className="nc-menu-wrapper">
                  <button
                    className="nc-menu-btn"
                    onClick={() =>
                      setOpenMenu(openMenu === comment._id ? null : comment._id)
                    }
                  >
                    <Ellipsis size={18} />
                  </button>
                  <AnimatePresence>
                    {openMenu === comment._id && (
                      <motion.div
                        className="nc-dropdown"
                        initial={{ opacity: 0, scale: 0.9, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <button
                          className="nc-dropdown-item danger"
                          onClick={() => {
                            deleteComment(comment._id);
                            setOpenMenu(null);
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ellipsis for others */}
              {!(user && comment.User?._id?.toString() === user._id?.toString()) && (
                <div className="nc-report">
                  <Ellipsis size={18} />
                </div>
              )}
            </div>

            {/* body */}
            <div className="nc-card-body">
              <p>
                {comment.comment.slice(0, 400)}
                {comment.comment.length > 400 ? " ...more" : ""}
              </p>
            </div>

            {/* actions */}
            <div className="nc-card-actions">
              <div className="nc-action-row">
                <button
                  className={`nc-action-btn ${comment.isLiked ? "liked" : ""}`}
                  onClick={() => toggleLike(comment._id)}
                >
                  <ThumbsUp size={16} />
                  <span>{formatCompactNumber(comment.likesCount || 0)}</span>
                </button>

                <button
                  className="nc-action-btn"
                  onClick={() => {
                    if (revealReply === comment._id) {
                      setRevealReply(null);
                    } else {
                      setRevealReply(comment._id);
                      if (comment.repliesCount > 0) {
                        fetchReplies(comment._id);
                      }
                    }
                  }}
                >
                  <MessageCircle size={16} />
                  <span>{formatCompactNumber(comment.repliesCount || 0)}</span>
                </button>
              </div>
            </div>

            {/* reply modal */}
            {revealReply === comment._id && (
              <NewsCommentReply
                comment={comment}
                replies={repliesMap[comment._id] || []}
                closing={setRevealReply}
              />
            )}
          </motion.div>
        ))}
      </div>

      <div ref={bottomRef} style={{ height: "20px" }} />
    </motion.div>
  );
}
