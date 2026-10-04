const express = require("express");
const router = express.Router();

const {
  Login,
  GetMe,
  Signing_Up_Requesting,
  Signing_Up_Verifying,
  Password_Reseting_Requesting,
  Password_Reseting_Verifying,
  Password_Reseting,
  DeletingOTP,
  GetUserProfile,
  UpdateUserProfile,
  GetUserSettings,
  UpdateUserSettings,
  ChangePassword,
  FollowUser,
  UnfollowUser,
  GetUserFollowers,
  GetUserFollowing,
  GetUserWatchlistForProfile,
  GetUserReviewsForProfile,
  GetUserRatingsForProfile,
  GetUserActivityForProfile,
  GetUserLikesForProfile,
} = require("../controllers/UserControllers");

const { protect, optionalProtect } = require("../middleware/Protect");

// Auth routes
router.post("/signup/request", Signing_Up_Requesting);
router.post("/signup/verify", Signing_Up_Verifying);
router.post("/login", Login);
router.post("/password/request", Password_Reseting_Requesting);
router.post("/password/verify", Password_Reseting_Verifying);
router.post("/password/resting", Password_Reseting);
router.post("/otp", DeletingOTP);
router.get("/me", protect, GetMe);

// Profile & Dashboard routes
router.get("/profile", protect, (req, res, next) => {
  req.params.identifier = "me";
  return GetUserProfile(req, res, next);
});
router.get("/profile/:identifier", optionalProtect, GetUserProfile);
router.put("/profile", protect, UpdateUserProfile);

// Settings & Security routes
router.get("/settings", protect, GetUserSettings);
router.put("/settings", protect, UpdateUserSettings);
router.put("/security/password", protect, ChangePassword);

// Follow / Social routes
router.post("/follow/:targetUserId", protect, FollowUser);
router.post("/unfollow/:targetUserId", protect, UnfollowUser);
router.get("/:identifier/followers", optionalProtect, GetUserFollowers);
router.get("/:identifier/following", optionalProtect, GetUserFollowing);

// Profile Tab Content routes
router.get("/:identifier/watchlist", optionalProtect, GetUserWatchlistForProfile);
router.get("/:identifier/reviews", optionalProtect, GetUserReviewsForProfile);
router.get("/:identifier/ratings", optionalProtect, GetUserRatingsForProfile);
router.get("/:identifier/activity", optionalProtect, GetUserActivityForProfile);
router.get("/:identifier/likes", optionalProtect, GetUserLikesForProfile);

module.exports = router;
