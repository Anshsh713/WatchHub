const express = require("express");
const { protect: authMiddleware } = require("../middleware/Protect");
const adminMiddleware = require("../middleware/AdminProtect");
const router = express.Router();

const {
  getFranchises,
  getFranchiseDetails,
  getFranchiseContent,
  createFranchise,
  updateFranchise,
  deleteFranchise,
  followFranchise,
  unfollowFranchise,
  myFranchises,
  seedFranchises,
} = require("../controllers/FranchiseControllers");

router.get("/", getFranchises);
router.post("/seed", seedFranchises);

router.get("/my/following", authMiddleware, myFranchises);

router.post("/follow/:id", authMiddleware, followFranchise);

router.delete("/follow/:id", authMiddleware, unfollowFranchise);

router.post("/", authMiddleware, adminMiddleware, createFranchise);

router.put("/:id", authMiddleware, adminMiddleware, updateFranchise);

router.delete("/:id", authMiddleware, adminMiddleware, deleteFranchise);

router.get("/:slug/content", getFranchiseContent);

router.get("/:slug", getFranchiseDetails);

module.exports = router;
