import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import "./Review.css";
import MediaReviews from "./MediaReviews";
import RatingSemiPie from "../Common/RatingChart";
import { useMediaReviews } from "../../Context/MediaReviewsContext";
import { Pen, PenOff } from "lucide-react";
import { useWatchList } from "../../Context/WatchListContext";
import { useSelector } from "react-redux";
import { formatCompactNumber } from "../../utils/formatters";

const MotionDiv = motion.div;
const MotionSpan = motion.span;
const MotionUl = motion.ul;

export default function ReviewFilter({ mediaID, mediaType }) {
  const [sortOpen, setSortOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [sortValue, setSortValue] = useState("Most Liked");
  const [typeValue, setTypeValue] = useState("All");
  const { fetchStats, stats } = useMediaReviews();
  const { fetchWatchlistItem, getWatchlistItemData } = useWatchList();
  const { status: authStatus } = useSelector((state) => state.auth);
  const optionsSort = ["Most Liked", "Most Recent", "Oldest"];
  const optionsType = ["All", "Following", "Friends", "By Me"];
  const sortMap = {
    "Most Liked": "mostLiked",
    "Most Recent": "latest",
    Oldest: "oldest",
  };

  const filterMap = {
    All: "all",
    "By Me": "byMe",
    Following: "following",
    Friends: "friends",
  };

  const [isOn, setIsOn] = useState(false);
  const [writingReviewKey, setWritingReviewKey] = useState(null);
  const reviewEligibilityKey = `${authStatus}-${mediaType}-${mediaID}`;
  const watchlistItem = getWatchlistItemData(mediaID, mediaType);
  const canWriteReview =
    authStatus &&
    ["completed", "watching", "on_hold", "dropped"].includes(
      watchlistItem?.status,
    );
  const writingReview = writingReviewKey === reviewEligibilityKey;
  const totalReviews = stats?.total ?? 0;

  useEffect(() => {
    if (authStatus && mediaID && mediaType) {
      fetchWatchlistItem(mediaID, mediaType);
    }
  }, [authStatus, fetchWatchlistItem, mediaID, mediaType]);

  const toggleSwitch = () => {
    setIsOn(!isOn);
    setSortOpen(false);
    setTypeOpen(false);
  };

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

  useEffect(() => {
    fetchStats(mediaID);
  }, [mediaID]);

  return (
    <div className="review">
      <RatingSemiPie stats={stats?.stats} total={stats?.total} />
      <div className="review-filter">
        <h1>
          Reviews{" "}
          <MotionSpan
            key={totalReviews}
            className="review-count"
            title={totalReviews.toLocaleString()}
            aria-label={`${totalReviews.toLocaleString()} reviews`}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {formatCompactNumber(totalReviews)}
          </MotionSpan>
        </h1>
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
                <MotionUl
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
                </MotionUl>
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
                <MotionUl
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
                </MotionUl>
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
              <MotionDiv
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
          {canWriteReview && (
            <div className="writing-review">
              <button
                title={writingReview ? "Close Review" : "Write Review"}
                onClick={() => {
                  setWritingReviewKey(
                    writingReview ? null : reviewEligibilityKey,
                  );
                  setSortOpen(false);
                  setTypeOpen(false);
                }}
                aria-label={writingReview ? "Close Review" : "Write Review"}
              >
                {writingReview ? <PenOff size={18} /> : <Pen size={18} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <MediaReviews
        mediaID={mediaID}
        mediaType={mediaType}
        writingReview={writingReview}
        setWritingReview={(open) =>
          setWritingReviewKey(open ? reviewEligibilityKey : null)
        }
        sort={sortMap[sortValue]}
        filter={filterMap[typeValue]}
        showSpoiler={isOn}
      />
    </div>
  );
}
