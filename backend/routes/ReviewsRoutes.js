const router = require("express").Router();

const {
  createReview,
  getReviewsStats,
  toggleLikeReview,
  addReply,
  deleteReview,
  getReviewsByMedia,
  toggleLikeReply,
} = require("../controllers/ReviewControllers");

const { protect } = require("../middleware/Protect");
router.post("/create", protect, createReview);
router.get("/stats/:MediaID", getReviewsStats);
router.get("/:MediaID", protect, getReviewsByMedia);
router.put("/like/:reviewId", protect, toggleLikeReview);
router.put("/like-reply/:reviewId/:replyId", protect, toggleLikeReply);
router.post("/reply/:reviewId", protect, addReply);
router.delete("/:reviewId", protect, deleteReview);

module.exports = router;
