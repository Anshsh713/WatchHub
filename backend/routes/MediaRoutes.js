const express = require("express");
const router = express.Router();

const {
  getMedia,
  getMediaDetails,
} = require("../controllers/MediaControllers");

router.get("/media", getMedia);
router.get("/media/:id", getMediaDetails);

module.exports = router;
