"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useMedia } from "../../Context/MediaContext";
import "./Home.css";

const left = "0%";
const right = "100%";
const leftInset = "5%";
const rightInset = "95%";
const transparent = "#0000";
const opaque = "#000";

function useScrollOverflowMask(scrollXProgress) {
  const maskImage = useMotionValue(
    `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`,
  );

  useMotionValueEvent(scrollXProgress, "change", (value) => {
    if (value === 0) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`,
      );
    } else if (value === 1) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`,
      );
    } else if (
      scrollXProgress.getPrevious() === 0 ||
      scrollXProgress.getPrevious() === 1
    ) {
      animate(
        maskImage,
        `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`,
      );
    }
  });

  return maskImage;
}

export default function HorizontalMediaList({ media, type }) {
  const ref = useRef(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const maskImage = useScrollOverflowMask(scrollXProgress);
  const { fetchMediaDetails } = useMedia();

  return (
    <div className="scroll-linked-container">
      <svg id="progress" width="50" height="50" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" pathLength="1" className="bg" />
        <motion.circle
          cx="50"
          cy="50"
          r="30"
          className="indicator"
          style={{ pathLength: scrollXProgress }}
        />
      </svg>
      <motion.ul ref={ref} style={{ maskImage }} className="media-list">
        {media?.map((item) => (
          <Link
            key={item.id}
            to={`/media/${type === "all" ? item.media_type : type}/${item.id}`}
          >
            <li key={item.id} className="media-card-wrapper">
              <div className="media-card">
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                />
                <div className="media-info">
                  <h4>{item.title || item.name}</h4>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </motion.ul>
    </div>
  );
}
