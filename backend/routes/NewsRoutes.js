const router = require("express").Router();
const {
  getNews,
  getNewsDetails,
  ToggleNewsReaction,
  getNewsReactions,
  getNewsById,
  ToggleSaveNews,
  GetSavedNews,
  CheckSavedNews,
} = require("../controllers/NewsControllers");
const { protect, optionalProtect } = require("../middleware/Protect");

router.get("/", getNews);

router.post("/toggle-reaction", protect, ToggleNewsReaction);
router.get("/:newsId/reactions", optionalProtect, getNewsReactions);

router.post("/save", protect, ToggleSaveNews);
router.get("/saved", protect, GetSavedNews);
router.get("/saved/:NewsID", protect, CheckSavedNews);

router.get("/details/:articleId", getNewsById);

// LAST
router.get("/:articleUrl", getNewsDetails);
module.exports = router;
