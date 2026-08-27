const express = require("express");
const { protect } = require("../middleware/Protect");

const {
  getWatchlist,
  getWatchlistItem,
  addToWatchlist,
  updateWatchlistStatus,
  updateWatchlistRating,
  updateWatchlistItem,
  removeFromWatchlist,
  getWatchHistory,
  removeFromHistory,
  clearWatchHistory,
  getUpcomingWatchlist,
  getWatchlistStats,
} = require("../controllers/WatchlistControllers");

const router = express.Router();

// All watchlist routes require user authentication
router.use(protect);

// 1. General list and add
router.get("/", getWatchlist);
router.post("/", addToWatchlist);

// 2. Aggregate stats & special views
router.get("/stats", getWatchlistStats);
router.get("/upcoming", getUpcomingWatchlist);

// 3. Watch history
router.get("/history", getWatchHistory);
router.delete("/history", clearWatchHistory);
router.patch("/history/:mediaType/:mediaId", removeFromHistory);

// 4. Single item checks and status/rating updates
router.get("/item/:mediaType/:mediaId", getWatchlistItem);
router.patch("/:mediaType/:mediaId/status", updateWatchlistStatus);
router.patch("/:mediaType/:mediaId/rating", updateWatchlistRating);
router.patch("/:mediaType/:mediaId", updateWatchlistItem);
router.delete("/:mediaType/:mediaId", removeFromWatchlist);

module.exports = router;
