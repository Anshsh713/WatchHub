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
  addView,
  getViews,
} = require("../controllers/NewsControllers");
const { protect, optionalProtect } = require("../middleware/Protect");

router.get("/", getNews);

router.post("/toggle-reaction", protect, ToggleNewsReaction);
router.get("/:newsId/reactions", optionalProtect, getNewsReactions);

router.post("/save", protect, ToggleSaveNews);
router.get("/saved", protect, GetSavedNews);
router.get("/saved/:NewsID", protect, CheckSavedNews);

router.get("/details/:articleId", getNewsById);

router.post("/view", protect, addView);

router.get("/view/:NewsID", getViews);

// LAST
router.get("/:articleUrl", getNewsDetails);
module.exports = router;
