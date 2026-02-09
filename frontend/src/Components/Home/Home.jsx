import React, { useState } from "react";
import { Play, Info } from "lucide-react";
import { motion } from "framer-motion";
import "./Home.css";

const MOCK_DATA = {
  hero: {
    title: "Cyberpunk: Edgerunners",
    description: "In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw — an edgerunner.",
    image: "https://images4.alphacoders.com/132/1328972.jpeg", // High quality Anime wallpaper
  },
  categories: [
    {
      title: "Trending Now",
      items: [
        "https://m.media-amazon.com/images/M/MV5BMmM2ODIyNDQtZjViYi00ZDYyLTlhMDItOTZiYWRlOTg3NDQ4XkEyXkFqcGdeQXVyMTEyNzgwMDUw._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxODMxY2UyXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNGYyNmI3M2YtNzYzZS00OTViLTkxYjAtZDQ1MjQwZmJiMmZlXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_FMjpg_UX1000_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNjgwNzE5ODgtYzYyNS00MzU1LWI1NzAtMWEyNzE1MTZiNjMzXkEyXkFqcGdeQXVyAMSzNzA5NzE@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BMjYxZjFkMzUtYjA2YS00OGIxLWE0OTgtYjc3ZjE2ZDRjZWNhXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BYTJlZDcwY2QtYzRhMy00MjAtMjRjNS0wNWViNmJjM2I1ZDVhXkEyXkFqcGdeQXVyODMyNTM0MjM@._V1_.jpg"
      ]
    },
    {
      title: "New Releases",
      items: [
        "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BN2FjNmEyNWMtYzM0ZS00NjIyLTg5YzYtYThlMGVjNzE1OGViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_FMjpg_UX1000_.jpg",
        "https://m.media-amazon.com/images/M/MV5BN2RjZDJhYzUtOTQ5Yy00OWM3LWE5NjEtZTM5ZGUzZmU3YjIzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BODZhNzlmOGItMTA1Zi00YjhjLThkNzYtNjY0YmExM2MzMWM1XkEyXkFqcGdeQXVyMTEyNzgwMDUw._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
      ]
    },
    {
      title: "Anime Hits",
      items: [
        "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_FMjpg_UX1000_.jpg",
        "https://m.media-amazon.com/images/M/MV5BODkyYTRlMDItMDlhMC00MTEzLWI3NWEtZmIyMjE2NmU5Yjg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNjRjMjg2MTEtYTUxOS00MTViLWIxMDQtYjVjYjgyYmIyMTJiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5BOWNhMWMzYkQtNjA2Yi00MWViLTg1MGQtYzYzYjgwYjgxMzRhXkEyXkFqcGdeQXVyMTEyNzgwMDUw._V1_FMjpg_UX1000_.jpg",
        "https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3NzYtZWJkNjIyNDRhNjE1XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
        "https://m.media-amazon.com/images/M/MV5CNTYzYTFkODktYjU0MS00MzExLTk3OWQtYWJjZGFlOTdhZmVlXkEyXkFqcGdeQXVyMTM1NjM2ODg1._V1_.jpg"
      ]
    }
  ]
};

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div
        className="hero"
        style={{ backgroundImage: `url(${MOCK_DATA.hero.image})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {MOCK_DATA.hero.title}
          </motion.h1>
          <motion.p
            className="hero-description"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {MOCK_DATA.hero.description}
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button className="btn btn-play">
              <Play fill="black" size={24} /> Play
            </button>
            <button className="btn btn-info">
              <Info size={24} /> More Info
            </button>
          </motion.div>
        </div>
      </div>

      {/* Content Rows - Fixed structure as requested */}
      <div className="content-rows">
        {MOCK_DATA.categories.map((category, index) => (
          <div key={index} className="category-row">
            <h3 className="category-title">{category.title}</h3>
            <div className="row-container">
              {/* Directly mapping items in a scrollable div */}
              {category.items.map((item, i) => (
                <motion.div
                  key={i}
                  className="movie-card"
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img src={item} alt={`${category.title} ${i}`} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
