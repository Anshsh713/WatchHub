import React, { useState, useEffect } from "react";
import { useNews } from "../../../Context/NewsContext";
import { useParams, useLocation } from "react-router-dom";
import VideoLoader from "../../Common/VideoLoader.jsx";
import { ArrowRight } from "lucide-react";
import "./Detail.css";

export default function Detail(type) {
  const location = useLocation();
  const newsDetails = location.state;
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
      </div>
    </div>
  );
}
