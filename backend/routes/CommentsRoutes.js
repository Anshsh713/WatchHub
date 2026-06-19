const router = require("express").Router();

const {
  createComments,
  toggleLikeComment,
  addReply,
  addReplyLike,
  deleteComment,
  getCommentsByNews,
  getReplies,
} = require("../controllers/NewsCommentsControllers");

const { protect } = require("../middleware/Protect");

router.post("/create", protect, createComments);

router.put("/like/:commentId", protect, toggleLikeComment);

router.put("/like-reply/:commentId/:replyId", protect, addReplyLike);

router.post("/reply/:commentId", protect, addReply);

router.get("/replies/:commentId", protect, getReplies);

router.delete("/:commentId", protect, deleteComment);

router.get("/:NewsID", protect, getCommentsByNews);

module.exports = router;
