const express = require("express");
const router = express.Router();

const { getMedia } = require("../controllers/MediaControllers");

router.get("/media", getMedia);

module.exports = router;
