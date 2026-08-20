"use client";

import React, { useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import "./Home.css";

const left = "0%";
const right = "100%";
const leftInset = "4%";
const rightInset = "96%";
const transparent = "#0000";
const opaque = "#000";

function useScrollOverflowMask(scrollXProgress) {
  const maskImage = useMotionValue(
    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`,
  );

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    if (value <= 0.02) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`,
      );
    } else if (value >= 0.98) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`,
      );
    } else {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`,
      );
    }
  });

  return maskImage;
}

export default function HorizontalMediaList({
  media = [],
  type = "all",
  title,
  icon,
  badge,
  badgeClass,
  loading = false,
}) {
  const ref = useRef(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const maskImage = useScrollOverflowMask(scrollXProgress);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    setCanScrollLeft(value > 0.02);
    setCanScrollRight(value < 0.98);
  });

  const handleScroll = (direction) => {
    if (ref.current) {
      const scrollAmount =
        direction === "left"
          ? -ref.current.clientWidth * 0.75
          : ref.current.clientWidth * 0.75;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && (!media || media.length === 0)) {
    return null;
  }

  return (
    <section className="home-section-row">
      {title && (
        <div className="section-header">
          <div className="section-title-wrapper">
            {icon && <span className="section-icon">{icon}</span>}
            <h3 className="section-title">{title}</h3>
            {badge && (
              <span className={`section-badge ${badgeClass || ""}`}>
                {badge}
              </span>
            )}
          </div>
          <div className="section-controls">
            <button
              className={`scroll-arrow-btn prev ${!canScrollLeft ? "disabled" : ""}`}
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`scroll-arrow-btn next ${!canScrollRight ? "disabled" : ""}`}
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="scroll-linked-container">
        <motion.ul ref={ref} style={{ maskImage }} className="media-list">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <li key={index} className="media-card-wrapper skeleton-card">
                  <div className="media-card skeleton-pulse" />
                </li>
              ))
            : media.map((item) => {
                const targetType =
                  item.media_type ||
                  (type === "all"
                    ? item.first_air_date
                      ? "tv"
                      : "movie"
                    : type);
                const year = (item.release_date || item.first_air_date || "")
                  .split("-")[0];
                const rating = item.vote_average
                  ? Number(item.vote_average).toFixed(1)
                  : null;

                return (
                  <Link
                    key={item.id}
                    to={`/media/${targetType}/${item.id}`}
                    className="media-card-link"
                  >
                    <li className="media-card-wrapper">
                      <div className="media-card">
                        {item.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title || item.name}
                            loading="lazy"
                          />
                        ) : (
                          <div className="media-placeholder">No Image</div>
                        )}

                        {rating && rating > "0.0" && (
                          <div className="card-rating-chip">
                            <Star size={11} fill="#eab308" color="#eab308" />
                            <span>{rating}</span>
                          </div>
                        )}

                        <div className="media-info">
                          <h4>{item.title || item.name}</h4>
                          <div className="media-meta">
                            {year && <span>{year}</span>}
                            {targetType && (
                              <span className="media-type-tag">
                                {targetType === "movie" ? "Movie" : "Series"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  </Link>
                );
              })}
        </motion.ul>
      </div>
    </section>
  );
}
