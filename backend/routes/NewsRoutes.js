const router = require("express").Router();
const {
  getNews,
  getNewsDetails,
  ToggleNewsReaction,
  getNewsReactions,
} = require("../controllers/NewsControllers");
const { protect, optionalProtect } = require("../middleware/Protect");

router.get("/", getNews);
router.get("/:articleUrl", getNewsDetails);
router.post("/toggle-reaction", protect, ToggleNewsReaction);
router.get("/:newsId/reactions", optionalProtect, getNewsReactions);
module.exports = router;
