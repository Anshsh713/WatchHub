const express = require("express");
const router = express.Router();
const {
  getMerchByMediaId,
  getAllMerch,
  createMerchItem,
  deleteMerchItem,
} = require("../controllers/MerchControllers");
const { optionalProtect } = require("../middleware/Protect");

router.get("/media/:mediaId", getMerchByMediaId);
router.get("/", getAllMerch);
router.post("/", optionalProtect, createMerchItem);
router.delete("/:id", optionalProtect, deleteMerchItem);

module.exports = router;
