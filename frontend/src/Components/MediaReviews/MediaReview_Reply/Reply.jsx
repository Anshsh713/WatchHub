import React, { useState, useEffect } from "react";
import "./Reply.css";

import { motion, AnimatePresence } from "framer-motion";

import { CircleUser, Heart, MessageCircle } from "lucide-react";

import { useMediaReviews } from "../../../Context/MediaReviewsContext";

import {
  formatRelativeTime,
  formatCompactNumber,
} from "../../../utils/formatters";

export default function Reply({ review, replies, closing }) {
  const [newReply, setNewReply] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(true);

  const { addReply, toggleLikeReply, fetchReplies, repliesPagination } =
    useMediaReviews();

  const pagination = repliesPagination?.[review._id];

  // =========================
  // LOAD REPLIES ON OPEN — new
  // Nothing previously called fetchReplies for page 1. handleLoadMore
  // only fires once pagination exists, and pagination only ever gets
  // set BY a fetchReplies call — so the modal opened empty every time.
  // =========================
  useEffect(() => {
    let cancelled = false;
    setLoadingReplies(true);

    fetchReplies(review._id, 1)
      .catch((error) => {
        console.error("Failed to load replies:", error);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingReplies(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // fetchReplies is a new function reference every render (not
    // wrapped in useCallback in the context), so it's deliberately
    // left out of the deps array to avoid an infinite fetch loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review._id]);

  const handleLoadMore = async () => {
    if (!pagination?.hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      await fetchReplies(review._id, pagination.currentPage + 1);
    } catch (error) {
      console.error("Failed to load more replies:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePostReply = async () => {
    if (!newReply.trim()) {
      return;
    }

    try {
      await addReply(review._id, newReply.trim());
      setNewReply("");
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  const buildReplyThreads = (replies) => {
    const map = {};
    replies.forEach((reply) => {
      map[reply._id] = reply;
    });

    const threadsById = {};
    const threads = [];

    replies.forEach((reply) => {
      if (!reply.replyingTo) {
        const thread = { ...reply, children: [] };
        threadsById[reply._id] = thread;
        threads.push(thread);
      }
    });

    const findThreadRoot = (reply) => {
      let current = reply;
      const seen = new Set();

      while (current.replyingTo) {
        if (seen.has(current._id)) {
          return null;
        }
        seen.add(current._id);

        const parent = map[current.replyingTo];
        if (!parent) {
          return null;
        }
        current = parent;
      }

      return current;
    };

    replies.forEach((reply) => {
      if (!reply.replyingTo) {
        return;
      }

      const root = findThreadRoot(reply);
      if (!root || !threadsById[root._id]) {
        return;
      }

      const immediateParent = map[reply.replyingTo];

      threadsById[root._id].children.push({
        ...reply,
        replyingToUsername:
          immediateParent?.user?.User_Name ||
          immediateParent?.User?.User_Name ||
          null,
      });
    });

    threads.forEach((thread) => {
      thread.children.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    });

    return threads;
  };

  const replyThreads = buildReplyThreads(replies || []);

  const totalReplies = pagination?.totalReplies ?? replies?.length ?? 0;

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
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="left-review">
          <div className="review-reply-header">
            <CircleUser size={46} className="user-avatar" />

            <div>
              <h3>
                {review.User?.User_Name || review.user?.User_Name || "User"}
              </h3>
              <p>{formatRelativeTime(review.createdAt)}</p>
            </div>

            <div className="review-of">
              <span
                className="rating-badge"
                style={{
                  background:
                    review.rating === "Skip it"
                      ? "#ef4444"
                      : review.rating === "TimePass"
                        ? "#facc15"
                        : review.rating === "Go for it"
                          ? "#22c55e"
                          : "#8b5cf6",
                }}
              >
                {review.rating}
              </span>
            </div>
          </div>

          <div className="review-text">{review.comment}</div>
        </div>

        <div className="right-replies">
          <div className="replies-header">
            <h4>
              Replies <span>({formatCompactNumber(totalReplies)})</span>
            </h4>
          </div>

          <div className="replies-list">
            <AnimatePresence initial={false}>
              {loadingReplies ? (
                <motion.div
                  className="no-replies"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p>Loading replies...</p>
                </motion.div>
              ) : replyThreads.length > 0 ? (
                replyThreads.map((reply) => (
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

            {pagination?.hasMore && (
              <motion.div
                className="load-more-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <button
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More Replies"}
                </button>
              </motion.div>
            )}
          </div>

          <div className="reply-input-wrapper">
            <div className="reply-input">
              <CircleUser size={35} className="current-user-avatar" />

              <input
                type="text"
                placeholder="Add a reply..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePostReply();
                  }
                }}
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

// =====================================================
// REPLY ITEM — unchanged, no bugs found here
// =====================================================

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

  const handleReply = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      await addReply(reviewId, text.trim(), reply._id);
      setText("");
      setShowReplyInput(false);
      setShowChildren(true);
    } catch (error) {
      console.error("Failed to add nested reply:", error);
    }
  };

  const username = reply.user?.User_Name || reply.User?.User_Name || "User";

  const mentionPrefix = reply.replyingToUsername
    ? `@${reply.replyingToUsername} `
    : null;
  const hasMention = mentionPrefix && reply.comment?.startsWith(mentionPrefix);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`reply-card ${isNested ? "is-nested" : ""}`}
    >
      <CircleUser size={isNested ? 26 : 32} className="reply-avatar" />

      <div className="reply-body">
        <div className="reply-main">
          <p className="reply-comment">
            <span className="reply-username">{username}</span>{" "}
            {hasMention ? (
              <>
                <span className="reply-mention">
                  @{reply.replyingToUsername}
                </span>{" "}
                {reply.comment.slice(mentionPrefix.length)}
              </>
            ) : (
              reply.comment
            )}
          </p>

          <button
            className="reply-like-btn"
            onClick={() => toggleLikeReply(reviewId, reply._id)}
          >
            <Heart size={14} className={reply.isLiked ? "liked" : ""} />
          </button>
        </div>

        <div className="reply-meta">
          <span className="reply-time">
            {formatRelativeTime(reply.createdAt)}
          </span>

          {reply.likesCount > 0 && (
            <span className="reply-likes-count">
              {formatCompactNumber(reply.likesCount)}{" "}
              {reply.likesCount === 1 ? "like" : "likes"}
            </span>
          )}

          <button
            className={`reply-btn-text ${showReplyInput ? "active" : ""}`}
            onClick={() => {
              setShowReplyInput(!showReplyInput);
              if (!showReplyInput) {
                setText(`@${username} `);
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
                  placeholder={`Reply to ${username}`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleReply();
                    }
                  }}
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
              : `View ${reply.children.length} Repl${
                  reply.children.length === 1 ? "y" : "ies"
                }`}
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
