import React, { useEffect } from "react";
import { useMedia } from "../../Context/MediaContext";
import HorizontalMediaList from "./HorizontalMediaList";
import { motion, AnimatePresence } from "framer-motion";
import "./Home.css";

export default function Movies_Section() {
  const { mediaMap, loading, error, setCurrentType, currentType } = useMedia();

  useEffect(() => {
    const savedType = localStorage.getItem("mediaType") || "all";
    handleChange(savedType);
  }, []);

  const handleChange = (type) => {
    setCurrentType(type);
    let themeClass = "";

    if (type === "movie") themeClass = "theme-movie";
    else if (type === "tv") themeClass = "theme-tv";
    else if (type === "anime") themeClass = "theme-anime";
    else themeClass = "";

    document.body.className = themeClass;
    localStorage.setItem("mediaType", type);
  };

  const selectedMedia = mediaMap[currentType] || [];

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
            className="filter-tab"
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

      <div className="Media">
        <div className="Media">
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}

          {!loading && selectedMedia?.length === 0 && <p>No media found</p>}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentType}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {!loading && selectedMedia?.length > 0 && (
                <HorizontalMediaList media={selectedMedia} type={currentType} />
              )}

              {!loading && selectedMedia?.length === 0 && <p>No media found</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
