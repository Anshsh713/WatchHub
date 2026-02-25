const router = require("express").Router();

const {
  createReview,
  getReviewsStats,
  toggleLikeReview,
  addReply,
  deleteReview,
  getReviewsByMedia,
} = require("../controllers/ReviewControllers");

const { protect } = require("../middleware/Protect");
router.post("/create", protect, createReview);
router.get("/stats/:MediaID", getReviewsStats);
router.get("/:MediaID", getReviewsByMedia);
router.put("/like/:reviewId", protect, toggleLikeReview);
router.post("/reply/:reviewId", protect, addReply);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
