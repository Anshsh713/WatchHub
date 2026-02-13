import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Changed from "motion/react" to "framer-motion" based on package.json
import { useMedia } from "../../Context/MediaContext";
import "./Home.css";

export default function HeroCarousel() {
  const { mediaMap, loading, currentType } = useMedia();
  const selectedMedia = mediaMap[currentType] || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Select 5 random items effectively
  const randomSelection = useMemo(() => {
    if (!selectedMedia || selectedMedia.length === 0) return [];
    // Shuffle and pick 5
    const shuffled = [...selectedMedia].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  }, [selectedMedia]);

  useEffect(() => {
    if (randomSelection.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % randomSelection.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(timer);
  }, [randomSelection]);

  if (loading || randomSelection.length === 0) {
    return null; // Or a skeleton loader
  }

  const currentItem = randomSelection[currentIndex];

  return (
    <div className="hero-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          className="hero-slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-backdrop">
            <img
              src={`https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`}
              alt={currentItem.title || currentItem.name}
            />
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {currentItem.title || currentItem.name}
            </motion.h1>
            <motion.p
              className="hero-overview"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {currentItem.overview}
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            ></motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="hero-indicators">
        {randomSelection.map((_, index) => (
          <button
            key={index}
            className={`indicator-dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
