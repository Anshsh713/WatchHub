import React, { useState, useEffect } from "react";
import { useNews } from "../../../Context/NewsContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import VideoLoader from "../../Common/VideoLoader.jsx";
import { ArrowRight } from "lucide-react";
import "./Detail.css";

export default function Detail(type) {
  const location = useLocation();
  const navigate = useNavigate();
  const newsDetails = location.state?.article || location.state;
  const allNews = location.state?.allNews || [];
  const relatedNews = allNews
    .filter(
      (item) =>
        item.url !== newsDetails?.url &&
        item.category === newsDetails?.category,
    )
    .slice(0, 5);

  const { getNewsReactions, toggleReaction } = useNews();
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
          if (data && data.reactions) {
            setReactionStats(data.reactions);
          }
        })
        .catch((err) => console.error("Error loading reactions:", err));
    }
  }, [newsDetails]);

  const handleReactionClick = async (type) => {
    if (!newsDetails?.url) return;

    setReactionStats((prev) => {
      const nextStats = { ...prev };
      if (prev.userReaction === type) {
        nextStats[type] = Math.max(0, nextStats[type] - 1);
        nextStats.userReaction = null;
      } else {
        if (prev.userReaction) {
          nextStats[prev.userReaction] = Math.max(
            0,
            nextStats[prev.userReaction] - 1,
          );
        }
        nextStats[type] = (nextStats[type] || 0) + 1;
        nextStats.userReaction = type;
      }
      return nextStats;
    });

    try {
      await toggleReaction(newsDetails.url, type);
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
      const data = await getNewsReactions(newsDetails.url);
      if (data && data.reactions) {
        setReactionStats(data.reactions);
      }
    }
  };

  const emojiMap = {
    like: "👍",
    hype: "🔥",
    shocked: "😲",
    sad: "😢",
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

  if (!newsDetails) {
    return (
      <div className="news-detail-container">
        <VideoLoader />
      </div>
    );
  }

  return (
    <div className="news-detail-container">
      <div className="banner">
        {newsDetails?.image ? (
          <img loading="lazy" src={newsDetails.image} alt={newsDetails.title} />
        ) : (
          <div className="banner-placeholder"></div>
        )}
        <div className="banner-overlay"></div>
      </div>

      <div className="news-main-content">
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
          <div className={`impact-badge ${newsDetails.impact.toLowerCase()}`}>
            {newsDetails.impact}
          </div>
        </div>

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

        <div className="news-reactions-container">
          <h3 className="reactions-title">How do you feel about this scoop?</h3>
          <div className="reactions-list">
            {Object.entries(emojiMap).map(([type, emoji]) => {
              const count = reactionStats[type] || 0;
              const isUserReaction = reactionStats.userReaction === type;
              return (
                <button
                  key={type}
                  className={`reaction-pill ${isUserReaction ? "active" : ""}`}
                  onClick={() => handleReactionClick(type)}
                >
                  <span className="reaction-emoji">{emoji}</span>
                  <span className="reaction-label">{type}</span>
                  <span className="reaction-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

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
                        state: {
                          article: item,
                          allNews: allNews,
                        },
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
                        <div className="related-image-placeholder"></div>
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
      </div>
    </div>
  );
}
