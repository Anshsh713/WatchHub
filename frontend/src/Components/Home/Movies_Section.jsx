import React, { useEffect } from "react";
import { useMedia } from "../../Context/MediaContext";
import HorizontalMediaList from "./HorizontalMediaList";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Star,
  TrendingUp,
  Sparkles,
  Gem,
} from "lucide-react";
import { SiNetflix, SiPrimevideo, SiCrunchyroll } from "react-icons/si";
import "./Home.css";

const JioHotstarLogo = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="hotstarGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d6fe" />
        <stop offset="60%" stopColor="#0077ff" />
        <stop offset="100%" stopColor="#0033aa" />
      </linearGradient>
    </defs>
    <path
      d="M12 2l2.4 5.8 6.2.5-4.7 4.2 1.4 6.1L12 15.5 6.7 18.6l1.4-6.1-4.7-4.2 6.2-.5L12 2z"
      fill="url(#hotstarGradIcon)"
    />
    <circle cx="12" cy="11.8" r="2.2" fill="#ffffff" />
  </svg>
);

export default function Movies_Section() {
  const {
    homeSections,
    homeLoading,
    error,
    setCurrentType,
    currentType,
  } = useMedia();

  useEffect(() => {
    const savedType = localStorage.getItem("mediaType") || "all";
    handleChange(savedType);
  }, []);

  const handleChange = (type) => {
    setCurrentType(type);
  };

  const tabs = [
    { label: "All", value: "all" },
    { label: "Movies", value: "movie" },
    { label: "TV Shows", value: "tv" },
    { label: "Anime", value: "anime" },
  ];

  return (
    <div className="Movie-Section">
      <div className="Main-filter">
        {tabs.map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => handleChange(tab.value)}
            className={`filter-tab ${currentType === tab.value ? "active" : ""}`}
            initial={false}
            animate={{
              color: currentType === tab.value ? "#fff" : "#aaa",
            }}
          >
            {tab.label}
            {currentType === tab.value && (
              <motion.div
                className="underline"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="home-sections-container">
        {error && <p className="error-text">{error}</p>}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentType}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="home-sections-list"
          >
            {/* 1. Trending Now */}
            <HorizontalMediaList
              title="Trending Now"
              icon={<Flame size={22} className="icon-trending" />}
              media={homeSections?.trending}
              type={currentType}
              loading={homeLoading}
            />

            {/* 2. Top Rated */}
            <HorizontalMediaList
              title="Top Rated"
              icon={<Star size={22} className="icon-top-rated" />}
              media={homeSections?.topRated}
              type={currentType}
              loading={homeLoading}
            />

            {/* 3. Popular This Week */}
            <HorizontalMediaList
              title="Popular This Week"
              icon={<TrendingUp size={22} className="icon-popular" />}
              media={homeSections?.popularThisWeek}
              type={currentType}
              loading={homeLoading}
            />

            {/* 4. Upcoming */}
            <HorizontalMediaList
              title="Upcoming"
              icon={<Sparkles size={22} className="icon-upcoming" />}
              media={homeSections?.upcoming}
              type={currentType}
              loading={homeLoading}
            />

            {/* 5. Hidden Gems */}
            <HorizontalMediaList
              title="Hidden Gems"
              icon={<Gem size={22} className="icon-hidden-gems" />}
              media={homeSections?.hiddenGems}
              type={currentType}
              loading={homeLoading}
            />

            {/* 6. Don't Miss These on Netflix */}
            <HorizontalMediaList
              title="Don't Miss These on Netflix"
              icon={
                <div className="platform-icon-wrap netflix-wrap">
                  <SiNetflix size={18} color="#E50914" />
                </div>
              }
              media={homeSections?.netflix}
              type={currentType}
              loading={homeLoading}
            />

            {/* 7. Don't Miss These on JioHotstar */}
            <HorizontalMediaList
              title="Don't Miss These on JioHotstar"
              icon={
                <div className="platform-icon-wrap jiohotstar-wrap">
                  <JioHotstarLogo size={18} />
                </div>
              }
              media={homeSections?.jiohotstar}
              type={currentType}
              loading={homeLoading}
            />

            {/* 8. Don't Miss These on Prime */}
            <HorizontalMediaList
              title="Don't Miss These on Prime"
              icon={
                <div className="platform-icon-wrap prime-wrap">
                  <SiPrimevideo size={22} color="#00A8E1" />
                </div>
              }
              media={homeSections?.prime}
              type={currentType}
              loading={homeLoading}
            />

            {/* 9. Don't Miss These on Crunchyroll */}
            <HorizontalMediaList
              title="Don't Miss These on Crunchyroll"
              icon={
                <div className="platform-icon-wrap crunchyroll-wrap">
                  <SiCrunchyroll size={18} color="#F47521" />
                </div>
              }
              media={homeSections?.crunchyroll}
              type={currentType}
              loading={homeLoading}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
