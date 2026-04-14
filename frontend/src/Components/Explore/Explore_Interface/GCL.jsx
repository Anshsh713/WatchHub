import React, { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useMedia } from "../../../Context/MediaContext";
import { useNavigate } from "react-router-dom";
import VideoLoader from "../../Common/VideoLoader";
import "./Interface.css";

export default function GCL({ typeofgcl, setMediaType }) {
  const {
    fetchGenres,
    fetchCountries,
    fetchLanguages,
    typesofmedia,
    loading,
    fetchMediaByGenre,
  } = useMedia();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (typeofgcl === "Genres") {
        await fetchGenres();
      } else if (typeofgcl === "Countries") {
        await fetchCountries();
      } else if (typeofgcl === "Languages") {
        await fetchLanguages();
      }
    };

    fetchData();
  }, [typeofgcl]);

  if (loading) {
    return <VideoLoader />;
  }

  const getInitials = (str) => {
    if (!str) return "";
    return str.substring(0, 2).toUpperCase();
  };

  const getGenreColor = (name) => {
    const genreColors = {
      Action: "rgba(229, 9, 20, 0.15)",
      "Action & Adventure": "rgba(229, 9, 20, 0.15)",
      Adventure: "rgba(234, 88, 12, 0.15)",
      Animation: "rgba(236, 72, 153, 0.15)",
      Comedy: "rgba(234, 179, 8, 0.15)",
      Crime: "rgba(113, 113, 122, 0.15)",
      Documentary: "rgba(168, 162, 158, 0.15)",
      Drama: "rgba(120, 113, 108, 0.15)",
      Family: "rgba(52, 211, 153, 0.15)",
      Fantasy: "rgba(192, 132, 252, 0.15)",
      History: "rgba(180, 83, 9, 0.15)",
      Horror: "rgba(63, 63, 70, 0.3)",
      Music: "rgba(96, 165, 250, 0.15)",
      Mystery: "rgba(168, 85, 247, 0.15)",
      Romance: "rgba(244, 63, 94, 0.15)",
      "Science Fiction": "rgba(20, 184, 166, 0.15)",
      "Sci-Fi & Fantasy": "rgba(20, 184, 166, 0.15)",
      Sports: "rgba(249, 115, 22, 0.15)",
      Thriller: "rgba(59, 130, 246, 0.15)",
      War: "rgba(82, 82, 91, 0.15)",
      "War & Politics": "rgba(82, 82, 91, 0.15)",
      Western: "rgba(217, 119, 6, 0.15)",
      Kids: "rgba(250, 204, 21, 0.15)",
      News: "rgba(156, 163, 175, 0.15)",
      Reality: "rgba(251, 146, 60, 0.15)",
      Soap: "rgba(244, 114, 182, 0.15)",
      Talk: "rgba(148, 163, 184, 0.15)",
      "TV Movie": "rgba(71, 85, 105, 0.15)",
    };
    return genreColors[name] || "rgba(255, 255, 255, 0.05)";
  };

  const renderCard = (item, index) => {
    if (typeofgcl === "Genres") {
      const name = item.name;
      const color = getGenreColor(name);
      return (
        <motion.div
          key={index}
          className="type_card genre_card"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate(`/genre/${item.id}`)}
          style={{
            background: `radial-gradient(circle at bottom right, ${color}, rgba(25, 25, 25, 0.9) 60%)`,
          }}
        >
          <span className="genre_name">{name}</span>
        </motion.div>
      );
    } else if (typeofgcl === "Countries") {
      const name = item.name;
      const code = item.code || "us";
      return (
        <motion.div
          key={index}
          className="type_card country_card"
          whileHover={{ scale: 1.05 }}
        >
          <img
            loading="lazy"
            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
            alt={name}
            className="country_flag"
          />
          <span className="country_name">{name}</span>
        </motion.div>
      );
    } else if (typeofgcl === "Languages") {
      const name = item.name;
      const displayInitials = getInitials(name);
      return (
        <motion.div
          key={index}
          className="type_card language_card"
          whileHover={{ scale: 1.05 }}
        >
          <div className="language_initials">{displayInitials}</div>
          <span className="language_name">{name}</span>
        </motion.div>
      );
    }
  };

  return (
    <div className="type_of">
      <motion.div className="type_of_title">
        <ChevronLeft className="back-icon" onClick={() => setMediaType(null)} />
        <h2>{typeofgcl}</h2>
      </motion.div>

      <div className={`type_grid ${typeofgcl.toLowerCase()}_grid`}>
        {typesofmedia &&
          typesofmedia.map((item, index) => renderCard(item, index))}
      </div>
    </div>
  );
}
