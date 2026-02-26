import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import "./Review.css";
import MediaReviews from "./MediaReviews";
import { Pen, PenOff } from "lucide-react";

export default function ReviewFilter({ mediaID, mediaType }) {
  const [sortOpen, setSortOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [sortValue, setSortValue] = useState("Most Recent");
  const [typeValue, setTypeValue] = useState("All");

  const optionsSort = ["Most Liked", "Most Recent", "Oldest"];
  const optionsType = ["All", "Following", "Friends", "By Me"];

  const [isOn, setIsOn] = useState(false);
  const [writingReview, setWritingReview] = useState(false);

  const toggleSwitch = () => setIsOn(!isOn);

  const container = {
    width: 50,
    height: 24,
    borderRadius: 50,
    cursor: "pointer",
    display: "flex",
    padding: 3,
    alignItems: "center",
    transition: "0.3s ease",
  };

  const handle = {
    width: 18,
    height: 18,
    borderRadius: "50%",
  };

  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setSortOpen(false);
        setTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="review">
      <div className="review-filter">
        <h1>Reviews</h1>
        <div className="filter" ref={filterRef}>
          <div className="dropdown">
            <button
              onClick={() => {
                setSortOpen(!sortOpen);
                setTypeOpen(false);
              }}
            >
              {sortValue}
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="dropdown-menu"
                >
                  {optionsSort.map((option) => (
                    <li
                      key={option}
                      onClick={() => {
                        setSortValue(option);
                        setSortOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div className="dropdown">
            <button
              onClick={() => {
                setTypeOpen(!typeOpen);
                setSortOpen(false);
              }}
            >
              {typeValue}
            </button>

            <AnimatePresence>
              {typeOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="dropdown-menu"
                >
                  {optionsType.map((option) => (
                    <li
                      key={option}
                      onClick={() => {
                        setTypeValue(option);
                        setTypeOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <div className="check-box">
            <button
              className="toggle-container"
              style={{
                ...container,
                justifyContent: isOn ? "flex-end" : "flex-start",
                backgroundColor: isOn
                  ? "var(--color-primary-hover)"
                  : "#2e2e35",
              }}
              onClick={toggleSwitch}
            >
              <motion.div
                className="toggle-handle"
                style={{
                  ...handle,
                  backgroundColor: isOn ? " var(--color-accent)" : "#999",
                }}
                layout
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              />
            </button>

            <span>Show Spoiler</span>
          </div>
          <div className="writing-review">
            <button onClick={() => setWritingReview(!writingReview)}>
              {writingReview ? <PenOff size={18} /> : <Pen size={18} />}
            </button>
          </div>
        </div>
      </div>

      <MediaReviews
        mediaID={mediaID}
        mediaType={mediaType}
        writingReview={writingReview}
      />
    </div>
  );
}
