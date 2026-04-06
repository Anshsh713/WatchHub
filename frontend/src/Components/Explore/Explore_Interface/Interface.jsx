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
import GCL from "./GCL";
import "./Interface.css";

export default function Explore_Interface() {
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
      {mediaType === "Genres" && <GCL typeofgcl="Genres" setMediaType={setMediaType} />}
      {mediaType === "Countries" && <GCL typeofgcl="Countries" setMediaType={setMediaType} />}
      {mediaType === "Languages" && <GCL typeofgcl="Languages" setMediaType={setMediaType} />}
    </div>
  );
}
