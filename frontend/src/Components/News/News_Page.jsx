import React, { useEffect, useState } from "react";
import { useNews } from "../../Context/NewsContext";
import { useNavigate } from "react-router-dom";
import API from "../../Services/Axios_api";
import {
  Calendar,
  User,
  Eye,
  ExternalLink,
  ArrowRight,
  X,
  EyeOff,
} from "lucide-react";
import "./Main_News.css";

export default function News_Page({ category, searchQuery }) {
  const { loading, error, news, fetchNews, getViews } = useNews();
  const [accumulatedNews, setAccumulatedNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const navigate = useNavigate();

  const [viewsMap, setViewsMap] = useState({});

  // Fetch initial news when filters change
  useEffect(() => {
    const loadInitialNews = async () => {
      setCurrentPage(1);
      setHasMore(true);
      // We call the context fetchNews for page 1
      await fetchNews({ contentType: category, search: searchQuery, page: 1 });
    };

    loadInitialNews();
  }, [category, searchQuery]);

  // Sync accumulated news with context when page 1 is loaded
  useEffect(() => {
    if (news) {
      setAccumulatedNews(news);
      if (news.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }
  }, [news]);

  const loadViews = async () => {
    const temp = {};

    for (const article of accumulatedNews) {
      try {
        temp[article.url] = await getViews(article.url);
      } catch {
        temp[article.url] = 0;
      }
    }

    setViewsMap(temp);
  };

  useEffect(() => {
    if (accumulatedNews.length > 0) {
      loadViews();
    }
  }, [accumulatedNews]);

  // Load more pages
  const handleLoadMore = async () => {
    if (fetchingMore || !hasMore) return;

    try {
      setFetchingMore(true);
      const nextPage = currentPage + 1;

      const { data } = await API.get("/news", {
        params: {
          contentType: category,
          search: searchQuery,
          page: nextPage,
        },
      });

      if (data.articles && data.articles.length > 0) {
        setAccumulatedNews((prev) => [...prev, ...data.articles]);
        setCurrentPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading more news:", err);
      setHasMore(false);
    } finally {
      setFetchingMore(false);
    }
  };

  // Helper to format Date string beautifully
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Format views with K/M suffixes
  const formatViews = (count) => {
    if (!count && count !== 0) return "0";

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Determine border and badge class by article content or category
  const getCategoryClass = (title = "", desc = "") => {
    const text = (title + " " + desc).toLowerCase();
    if (
      text.includes("anime") ||
      text.includes("manga") ||
      text.includes("crunchyroll") ||
      text.includes("naruto")
    )
      return "anime";
    if (
      text.includes("game") ||
      text.includes("gaming") ||
      text.includes("playstation") ||
      text.includes("xbox") ||
      text.includes("nintendo") ||
      text.includes("steam")
    )
      return "game";
    if (
      text.includes("television") ||
      text.includes("series") ||
      text.includes("netflix") ||
      text.includes("hbo") ||
      text.includes("show")
    )
      return "show";
    return "movie"; // Default to movie category
  };

  if (loading && currentPage === 1) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div className="news-card skeleton-card" key={idx}>
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-text"></div>
              <div className="skeleton-line skeleton-text-short"></div>
              <div className="skeleton-line skeleton-meta"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && accumulatedNews.length === 0) {
    return (
      <div className="news-error-container">
        <h2>Failed to load news</h2>
        <p>
          {error.message ||
            "An unexpected error occurred while fetching news articles."}
        </p>
        <button
          onClick={() =>
            fetchNews({ contentType: category, search: searchQuery, page: 1 })
          }
          className="retry-btn"
        >
          Retry Fetching
        </button>
      </div>
    );
  }

  if (accumulatedNews.length === 0) {
    return (
      <div className="news-empty-container">
        <h3>No news articles found</h3>
        <p>
          We couldn't find any news articles matching "{searchQuery || category}
          ". Try searching for something else or clearing filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="news-grid">
        {accumulatedNews.map((article) => {
          const catClass = getCategoryClass(article.title, article.description);
          const viewCount = viewsMap[article.url];
          const hasViews = viewCount && viewCount > 0;

          return (
            <div
              className={`news-card border-${catClass}`}
              key={article.url}
              onClick={() =>
                navigate(`/news/${encodeURIComponent(article.url)}`, {
                  state: {
                    article,
                    allNews: accumulatedNews,
                  },
                })
              }
            >
              <div className="news-image-wrapper">
                <img
                  src={article.image}
                  alt={article.title}
                  className="news-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop";
                  }}
                />
                <div className="detail">
                  <span className={`news-card-badge badge-${catClass}`}>
                    {catClass === "show" ? "TV SHOW" : catClass.toUpperCase()}
                  </span>

                  {/* Enhanced Views Counter - Only shows when views > 0 */}
                  {hasViews ? (
                    <div
                      className="news-card-views"
                      title={`${viewCount.toLocaleString()} views`}
                    >
                      <Eye size={13} className="views-icon" />
                      <span className="views-count">
                        {formatViews(viewCount)}
                      </span>
                      <span className="views-label">views</span>
                    </div>
                  ) : (
                    <div className="news-card-views-empty">
                      <EyeOff size={12} className="views-empty-icon" />
                      <span>New</span>
                    </div>
                  )}
                </div>
                {article.mostReactedEmoji && (
                  <span className="news-card-reaction-badge">
                    {article.mostReactedEmoji}
                  </span>
                )}
              </div>

              <div className="news-content">
                <div className="news-meta-top">
                  <span className="news-source">{article.source}</span>
                  <span className="news-date">
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <h3 className="news-title">{article.title}</h3>

                <p className="news-description">{article.description}</p>

                <div className="news-card-footer">
                  <span className="news-author">By {article.author}</span>
                  <button
                    className="read-more-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/news/${encodeURIComponent(article.url)}`, {
                        state: {
                          article,
                          allNews: accumulatedNews,
                        },
                      });
                    }}
                  >
                    Read Article <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button
            className="load-more-btn"
            onClick={handleLoadMore}
            disabled={fetchingMore}
          >
            {fetchingMore ? (
              <>
                <span className="loading-spinner"></span> Loading More...
              </>
            ) : (
              "Load More Scoop"
            )}
          </button>
        </div>
      )}
    </>
  );
}
