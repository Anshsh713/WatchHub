import React, { useState, useEffect } from "react";
import { Play, Info, ChevronRight, Star, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HOME_DATA } from "./HomeData";
import "./Home.css";

export default function Home() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HOME_DATA.hero.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentHero = HOME_DATA.hero[currentHeroIndex];

  return (
    <div className="home-container">
      {/* Hero Slider Section */}
      <div className="hero-slider">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-slide-bg"
            style={{ backgroundImage: `url(${currentHero.image})` }}
          >
            <div className="hero-overlay"></div>
          </motion.div>
        </AnimatePresence>

        <div className="hero-content">
          <motion.div
            key={currentHero.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="hero-meta-tags">
              <span className="meta-tag">{currentHero.type}</span>
              <span className="meta-tag">{currentHero.year}</span>
              <span className="meta-tag highlight">{currentHero.rating}</span>
            </div>
            <h1 className="hero-title">{currentHero.title}</h1>
            <p className="hero-description">{currentHero.description}</p>

            <div className="hero-buttons">
              <button className="btn btn-play">
                <Play fill="black" size={20} /> Play Now
              </button>
              <button className="btn btn-info">
                <Info size={20} /> More Info
              </button>
            </div>
          </motion.div>
        </div>

        {/* Hero Indicators */}
        <div className="hero-indicators">
          {HOME_DATA.hero.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentHeroIndex ? "active" : ""}`}
              onClick={() => setCurrentHeroIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* AI Recommendations Section */}
      <section className="section ai-section">
        <div className="section-header">
          <Sparkles className="section-icon ai-icon" />
          <h2 className="section-title">
            AI Picks <span className="subtitle">{HOME_DATA.aiRecommendations.message}</span>
          </h2>
        </div>
        <div className="horizontal-scroll">
          {HOME_DATA.aiRecommendations.items.map((item) => (
            <motion.div
              key={item.id}
              className="card ai-card"
              whileHover={{ scale: 1.05 }}
            >
              <img src={item.image} alt={item.title} />
              <div className="ai-match-badge">{item.match} Match</div>
              <div className="card-info">
                <h4>{item.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projected Interests Section */}
      <section className="section">
        <h2 className="section-title">Because You Watched...</h2>
        <div className="horizontal-scroll">
          {HOME_DATA.projectedInterests.map((item) => (
            <div key={item.id} className="card standard-card">
              <img src={item.image} alt={item.title} />
              <div className="card-reason">
                <TrendingUp size={14} /> {item.reason}
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Platform Hubs */}
      <section className="section platform-section">
        <h2 className="section-title">Explore Platforms</h2>

        {/* Prime Video */}
        <div className="platform-row">
          <h3 className="platform-name prime">Prime Video</h3>
          <div className="horizontal-scroll">
            {HOME_DATA.platforms.prime.map(item => (
              <motion.div key={item.id} whileHover={{ y: -5 }} className="card platform-card">
                <img src={item.image} alt={item.title} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Jio Cinema */}
        <div className="platform-row">
          <h3 className="platform-name jio">JioCinema</h3>
          <div className="horizontal-scroll">
            {HOME_DATA.platforms.jio.map(item => (
              <motion.div key={item.id} whileHover={{ y: -5 }} className="card platform-card">
                <img src={item.image} alt={item.title} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Crunchyroll */}
        <div className="platform-row">
          <h3 className="platform-name crunchyroll">Crunchyroll</h3>
          <div className="horizontal-scroll">
            {HOME_DATA.platforms.crunchyroll.map(item => (
              <motion.div key={item.id} whileHover={{ y: -5 }} className="card platform-card">
                <img src={item.image} alt={item.title} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Collections */}
      <section className="section">
        <h2 className="section-title">Curated Collections</h2>
        <div className="horizontal-scroll">
          {HOME_DATA.collections[0].items.map((item) => (
            <div key={item.id} className="collection-card">
              <img src={item.image} alt={item.name} />
              <div className="collection-overlay">
                <h3>{item.name}</h3>
                <p>{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Charts */}
      <section className="section top-charts-section">
        <div className="charts-container">
          <div className="chart-column">
            <h3 className="chart-title">Top Weekly</h3>
            <div className="chart-list">
              {HOME_DATA.topCharts.weekly.map((item, index) => (
                <div key={item.id} className="chart-item">
                  <span className="rank-number">{item.rank}</span>
                  <img src={item.image} alt={item.title} />
                  <div className="chart-info">
                    <h4>{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-column">
            <h3 className="chart-title">All-Time Favorites</h3>
            <div className="chart-list">
              {HOME_DATA.topCharts.allTime.map((item, index) => (
                <div key={item.id} className="chart-item">
                  <span className="rank-number">{item.rank}</span>
                  <img src={item.image} alt={item.title} />
                  <div className="chart-info">
                    <h4>{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Most Rated Rows */}
      <section className="section">
        <h2 className="section-title">Most Rated Movies</h2>
        <div className="horizontal-scroll">
          {HOME_DATA.mostRated.movies.map((img, i) => (
            <div key={i} className="card standard-card">
              <img src={img} alt="Movie" />
              <div className="rating-badge"><Star size={12} fill="gold" stroke="none" /> 4.8</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Top Anime</h2>
        <div className="horizontal-scroll">
          {HOME_DATA.mostRated.anime.map((img, i) => (
            <div key={i} className="card standard-card">
              <img src={img} alt="Anime" />
              <div className="rating-badge"><Star size={12} fill="gold" stroke="none" /> 4.9</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
