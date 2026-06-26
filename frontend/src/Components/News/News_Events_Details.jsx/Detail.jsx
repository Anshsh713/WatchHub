import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNews } from "../../../Context/NewsContext";
import { useLocation, useNavigate } from "react-router-dom";
import VideoLoader from "../../Common/VideoLoader.jsx";
import {
  ArrowRight,
  Share2,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  SlidersHorizontal,
  ChevronDown,
  Pencil,
  Eye,
  Smile,
} from "lucide-react";
import "./Detail.css";
import NewsComments from "../NewsComments/NewsComments.jsx";

export default function Detail() {
  const location = useLocation();
  const navigate = useNavigate();
  const newsDetails = location.state?.article || location.state;
  const allNews = location.state?.allNews || [];
  const [views, setViews] = useState(0);
  const [viewsUpdated, setViewsUpdated] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [writingComment, setWritingComment] = useState(false);
  const [sort, setSort] = useState("latest");
  const [filter, setFilter] = useState("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const viewUpdateTimeoutRef = useRef(null);
  const reactionPickerRef = useRef(null);

  const relatedNews = allNews
    .filter(
      (item) =>
        item.url !== newsDetails?.url &&
        item.category === newsDetails?.category,
    )
    .slice(0, 5);

  const {
    getNewsReactions,
    toggleReaction,
    isSaved,
    checkBookmark,
    toggleBookmark,
    addView,
    getViews,
  } = useNews();

  const [reactionStats, setReactionStats] = useState({
    like: 0,
    hype: 0,
    shocked: 0,
    sad: 0,
    userReaction: null,
  });

  useEffect(() => {
    if (newsDetails?.url) {
      getNewsReactions(newsDetails.url)
        .then((data) => {
          if (data && data.reactions) setReactionStats(data.reactions);
        })
        .catch((err) => console.error("Error loading reactions:", err));
    }
  }, [newsDetails]);

  useEffect(() => {
    if (newsDetails?.url) checkBookmark(newsDetails.url);
  }, [newsDetails]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target)
      ) {
        setShowReactionPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReactionClick = async (type) => {
    if (!newsDetails?.url) return;

    setReactionStats((prev) => {
      const next = { ...prev };
      if (prev.userReaction === type) {
        next[type] = Math.max(0, next[type] - 1);
        next.userReaction = null;
      } else {
        if (prev.userReaction) {
          next[prev.userReaction] = Math.max(0, next[prev.userReaction] - 1);
        }
        next[type] = (next[type] || 0) + 1;
        next.userReaction = type;
      }
      return next;
    });

    try {
      await toggleReaction(newsDetails.url, type);
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
      const data = await getNewsReactions(newsDetails.url);
      if (data && data.reactions) setReactionStats(data.reactions);
    }
  };

  const emojiMap = { like: "👍", hype: "🔥", shocked: "😲", sad: "😢" };
  const reactionLabels = {
    like: "Like it",
    hype: "Hyped",
    shocked: "Shocked",
    sad: "Sad",
  };

  const getCategoryClass = (title = "", desc = "") => {
    const text = (title + " " + desc).toLowerCase();
    if (text.includes("anime") || text.includes("manga")) return "anime";
    if (text.includes("game") || text.includes("gaming")) return "game";
    if (
      text.includes("television") ||
      text.includes("series") ||
      text.includes("netflix") ||
      text.includes("show")
    )
      return "show";
    return "movie";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format views with K/M suffixes
  const formatViews = useCallback((count) => {
    if (!count && count !== 0) return "0";

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  // Get formatted exact count for tooltip
  const getExactViews = useCallback((count) => {
    if (!count && count !== 0) return "0 views";
    return `${count.toLocaleString()} view${count !== 1 ? "s" : ""}`;
  }, []);

  const handleShare = async () => {
    const watchhubLink = `${window.location.origin}/news/${encodeURIComponent(newsDetails.url)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: newsDetails.title,
          text: newsDetails.description,
          url: watchhubLink,
        });
      } else {
        await navigator.clipboard.writeText(watchhubLink);
        setShowCopiedFeedback(true);
        setTimeout(() => setShowCopiedFeedback(false), 2000);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    }
  };

  useEffect(() => {
    const updateViews = async () => {
      if (!newsDetails?.url) return;

      try {
        // Get current views before adding
        const currentViews = await getViews(newsDetails.url);

        // Add new view
        await addView(newsDetails.url);

        // Get updated total
        const totalViews = await getViews(newsDetails.url);

        // Only trigger animation if views actually increased
        if (totalViews > (currentViews || 0)) {
          setViews(totalViews);
          setViewsUpdated(true);

          // Clear any existing timeout
          if (viewUpdateTimeoutRef.current) {
            clearTimeout(viewUpdateTimeoutRef.current);
          }

          // Reset animation class after animation completes
          viewUpdateTimeoutRef.current = setTimeout(() => {
            setViewsUpdated(false);
          }, 1000);
        } else {
          setViews(totalViews || currentViews || 0);
        }
      } catch (error) {
        console.error("Error updating views:", error);
      }
    };

    updateViews();

    // Cleanup timeout on unmount
    return () => {
      if (viewUpdateTimeoutRef.current) {
        clearTimeout(viewUpdateTimeoutRef.current);
      }
    };
  }, [newsDetails?.url]);

  if (!newsDetails) {
    return (
      <div className="news-detail-container">
        <VideoLoader />
      </div>
    );
  }

  /* total reactions for % bar */
  const totalReactions = Object.keys(emojiMap).reduce(
    (s, k) => s + (reactionStats[k] || 0),
    0,
  );

  return (
    <div className="news-detail-container">
      {/* Banner */}
      <div className="banner">
        {newsDetails?.image ? (
          <img loading="lazy" src={newsDetails.image} alt={newsDetails.title} />
        ) : (
          <div className="banner-placeholder" />
        )}
        <div className="banner-overlay" />
      </div>

      <div className="news-main-content">
        {/* Badge row */}
        <div className="nd-badge-row">
          {newsDetails.category && (
            <span
              className={`nd-badge badge-${getCategoryClass(newsDetails.title, newsDetails.description)}`}
            >
              {getCategoryClass(newsDetails.title, newsDetails.description) ===
              "show"
                ? "TV Show"
                : getCategoryClass(newsDetails.title, newsDetails.description)}
            </span>
          )}
          {newsDetails.source && (
            <span className="nd-badge badge-source">{newsDetails.source}</span>
          )}
          <div className={`impact-badge ${newsDetails.impact?.toLowerCase()}`}>
            {newsDetails.impact}
          </div>

          {/* Reactions trigger & Popover */}
          <div className="reaction-trigger-container" ref={reactionPickerRef}>
            <button
              className={`reaction-trigger-btn ${
                reactionStats.userReaction ? "has-reacted" : ""
              }`}
              onClick={() => setShowReactionPicker((prev) => !prev)}
              aria-label="React to this news"
            >
              <span className="reaction-trigger-emoji">
                {reactionStats.userReaction ? (
                  emojiMap[reactionStats.userReaction]
                ) : (
                  <Smile size={14} className="smile-icon" />
                )}
              </span>
              {totalReactions > 0 ? (
                <span className="reaction-trigger-count">{totalReactions}</span>
              ) : (
                !reactionStats.userReaction && <span className="reaction-trigger-add">+</span>
              )}
            </button>

            {showReactionPicker && (
              <div className="reaction-popover">
                {Object.entries(emojiMap).map(([key, emoji]) => {
                  const count = reactionStats[key] || 0;
                  const isActive = reactionStats.userReaction === key;
                  return (
                    <button
                      key={key}
                      className={`popover-reaction-option ${isActive ? "active" : ""}`}
                      onClick={() => {
                        handleReactionClick(key);
                        setShowReactionPicker(false);
                      }}
                      title={`${reactionLabels[key]} (${count})`}
                    >
                      <span className="popover-emoji">{emoji}</span>
                      <span className="popover-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Views Counter */}
          <div
            className={`views-counter ${viewsUpdated ? "updated" : ""}`}
            data-tooltip={views > 999 ? getExactViews(views) : null}
          >
            <div className="views-icon-wrapper">
              <Eye size={16} />
              <span className="views-live-dot" />
            </div>
            <span
              className={`views-number ${views >= 1000 ? "formatted" : ""}`}
            >
              {formatViews(views)}
            </span>
            {viewsUpdated && <span className="views-increment">+1</span>}
          </div>

          <div className="share">
            <button
              className={`nd-share-btn ${showCopiedFeedback ? "copied" : ""}`}
              onClick={handleShare}
            >
              <Share2 size={18} />
              {showCopiedFeedback ? "Copied!" : "Share"}
            </button>
          </div>
          <div className="bookmark">
            <button
              className={`bookmark-btn ${isSaved ? "saved" : ""}`}
              onClick={() => toggleBookmark(newsDetails)}
            >
              {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
          </div>
        </div>

        {/* Rest of your component remains the same */}
        <h1 className="nd-headline">{newsDetails.title}</h1>

        <div className="nd-meta-row">
          {newsDetails.author && <span>By {newsDetails.author}</span>}
          {newsDetails.author && newsDetails.publishedAt && (
            <span className="nd-dot" />
          )}
          {newsDetails.publishedAt && (
            <span>{formatDate(newsDetails.publishedAt)}</span>
          )}
        </div>

        <div className="nd-divider" />

        <p className="nd-description">{newsDetails.description}</p>

        <a
          href={newsDetails.url}
          target="_blank"
          rel="noopener noreferrer"
          className="nd-read-btn"
        >
          Read Full Article
          <ArrowRight size={15} />
        </a>



        {/* Info strip */}
        <div className="nd-info-strip">
          <div className="nd-info-cell">
            <p className="nd-info-label">Source</p>
            <p className="nd-info-value accent">{newsDetails.source || "—"}</p>
          </div>
          <div className="nd-info-cell">
            <p className="nd-info-label">Author</p>
            <p className="nd-info-value">{newsDetails.author || "—"}</p>
          </div>
          <div className="nd-info-cell">
            <p className="nd-info-label">Published</p>
            <p className="nd-info-value">
              {formatDate(newsDetails.publishedAt) || "—"}
            </p>
          </div>
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div className="related-news-section">
            <h2 className="related-news-heading">Related News</h2>
            <div className="related-news-grid">
              {relatedNews.map((item) => {
                const catClass = getCategoryClass(item.title, item.description);
                return (
                  <div
                    key={item.url}
                    className={`related-news-card border-${catClass}`}
                    onClick={() => {
                      navigate(`/news/${encodeURIComponent(item.url)}`, {
                        state: { article: item, allNews },
                      });
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="related-image-wrapper">
                      {item.image ? (
                        <img
                          loading="lazy"
                          src={item.image}
                          alt={item.title}
                          className="related-image"
                        />
                      ) : (
                        <div className="related-image-placeholder" />
                      )}
                      <span className={`related-badge badge-${catClass}`}>
                        {catClass === "show"
                          ? "TV SHOW"
                          : catClass.toUpperCase()}
                      </span>
                    </div>
                    <div className="related-content">
                      <div className="related-meta">
                        <span className="related-source">{item.source}</span>
                        <span className="related-date">
                          {formatDate(item.publishedAt)}
                        </span>
                      </div>
                      <h3 className="related-title">{item.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Community Discussion — BELOW related news ── */}
        <div className="nd-comments-section">
          <div className="nd-comments-header">
            <div className="nd-comments-title">
              <MessageSquare size={20} />
              <h3>Community Discussion</h3>
            </div>
            <div className="nd-comments-controls">
              {/* Sort */}
              <div className="nd-sort-wrapper">
                <button
                  className="nd-sort-btn"
                  onClick={() => setShowSortMenu((p) => !p)}
                >
                  <SlidersHorizontal size={15} />
                  <span>
                    {sort === "mostLiked"
                      ? "Most Liked"
                      : sort === "latest"
                        ? "Latest"
                        : "Oldest"}
                  </span>
                  <ChevronDown size={13} />
                </button>
                {showSortMenu && (
                  <div className="nd-sort-menu">
                    {[
                      { key: "mostLiked", label: "Most Liked" },
                      { key: "latest", label: "Latest" },
                      { key: "oldest", label: "Oldest" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        className={`nd-sort-item ${sort === s.key ? "active" : ""}`}
                        onClick={() => {
                          setSort(s.key);
                          setShowSortMenu(false);
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter */}
              <div className="nd-filter-pills">
                {["all", "byMe"].map((f) => (
                  <button
                    key={f}
                    className={`nd-filter-pill ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "All" : "My Comments"}
                  </button>
                ))}
              </div>

              {/* Write */}
              <button
                className="nd-write-btn"
                onClick={() => setWritingComment((p) => !p)}
              >
                <Pencil size={14} />
                {writingComment ? "Cancel" : "Write"}
              </button>
            </div>
          </div>

          <NewsComments
            newsId={newsDetails?.url}
            writingComment={writingComment}
            setWritingComment={setWritingComment}
            sort={sort}
            filter={filter}
          />
        </div>
      </div>
    </div>
  );
}
