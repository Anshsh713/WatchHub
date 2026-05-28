import React from "react";
import {
  Drama,
  Globe,
  Languages,
  Users,
  Trophy,
  Brain,
  Cat,
  Gem,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Search from "../../Common/Search";
import GCL from "./GCL";
import "./Interface.css";

export default function Explore_Interface() {
  const navigate = useNavigate();
  const [mediaType, setMediaType] = React.useState(null);
  const exploreOptions = [
    { name: "Genres", icon: <Drama /> },
    { name: "Countries", icon: <Globe /> },
    { name: "Languages", icon: <Languages /> },
    { name: "Family Friendly", icon: <Users /> },
    { name: "Award Winning", icon: <Trophy /> },
    { name: "Advanced Recommendations", icon: <Brain /> },
    { name: "Anime", icon: <Cat /> },
    { name: "Hidden Gems", icon: <Gem /> },
    { name: "Franchise", icon: <Video /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const mediaDetailtype = (type) => {
    if (type === "Genres") {
      setMediaType("Genres");
    } else if (type === "Countries") {
      setMediaType("Countries");
    } else if (type === "Languages") {
      setMediaType("Languages");
    } else if (type === "Family Friendly") {
      navigate("/explore/family");
    } else if (type === "Award Winning") {
      navigate("/explore/awards");
    } else if (type === "Anime") {
      navigate("/explore/anime");
    } else if (type === "Hidden Gems") {
      navigate("/explore/gems");
    } else if (type === "Franchise") {
      navigate("/explore/franchise");
    }
  };

  return (
    <div className="explore-interface">
      {mediaType === null && (
        <>
          <motion.h2
            className="explore-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore
          </motion.h2>
          <div className="explore-search">
            <Search placeholder="Search..." />
          </div>
          <motion.div
            className="explore-options"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {exploreOptions.map((option) => (
              <div
                key={option.name}
                className="explore"
                onClick={() => mediaDetailtype(option.name)}
              >
                <div className="explore-icon-wrapper">{option.icon}</div>
                <span>{option.name}</span>
              </div>
            ))}
          </motion.div>
        </>
      )}
      {mediaType === "Genres" && (
        <GCL typeofgcl="Genres" setMediaType={setMediaType} />
      )}
      {mediaType === "Countries" && (
        <GCL typeofgcl="Countries" setMediaType={setMediaType} />
      )}
      {mediaType === "Languages" && (
        <GCL typeofgcl="Languages" setMediaType={setMediaType} />
      )}
    </div>
  );
}
