const express = require("express");
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
} = require("../controllers/FranchiseControllers");

router.get("/", getFranchises);

router.get("/my/following", authMiddleware, myFranchises);

router.post("/follow/:id", authMiddleware, followFranchise);

router.delete("/follow/:id", authMiddleware, unfollowFranchise);

router.post("/", authMiddleware, adminMiddleware, createFranchise);

router.put("/:id", authMiddleware, adminMiddleware, updateFranchise);

router.delete("/:id", authMiddleware, adminMiddleware, deleteFranchise);

router.get("/:slug/content", getFranchiseContent);

router.get("/:slug", getFranchiseDetails);
