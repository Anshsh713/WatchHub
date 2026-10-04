const express = require("express");
const router = express.Router();

const {
  getClubs,
  getClubByIdentifier,
  createClub,
  updateClub,
  joinClub,
  leaveClub,
  getClubMembers,
  getClubPosts,
  createClubPost,
  deleteClubPost,
  toggleLikeClubPost,
  addClubPostComment,
  getUserClubs,
} = require("../controllers/ClubControllers");

const { protect, optionalProtect } = require("../middleware/Protect");

// Club listings & details
router.get("/", optionalProtect, getClubs);
router.post("/", protect, createClub);
router.get("/user/:identifier", optionalProtect, getUserClubs);
router.get("/:identifier", optionalProtect, getClubByIdentifier);
router.put("/:id", protect, updateClub);

// Join / Leave
router.post("/:id/join", protect, joinClub);
router.post("/:id/leave", protect, leaveClub);
router.get("/:id/members", optionalProtect, getClubMembers);

// Posts & Discussions
router.get("/:id/posts", optionalProtect, getClubPosts);
router.post("/:id/posts", protect, createClubPost);
router.delete("/posts/:postId", protect, deleteClubPost);
router.post("/posts/:postId/like", protect, toggleLikeClubPost);
router.post("/posts/:postId/comment", protect, addClubPostComment);

module.exports = router;
