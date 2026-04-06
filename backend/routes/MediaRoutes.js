const express = require("express");
const router = express.Router();

const {
  getMedia,
  getMediaDetails,
  getAllGenres,
  getAllCountries,
  getAllLanguages,
} = require("../controllers/MediaControllers");

router.get("/media/genres", getAllGenres);
router.get("/media/countries", getAllCountries);
router.get("/media/languages", getAllLanguages);

router.get("/media", getMedia);
router.get("/media/:id", getMediaDetails);

module.exports = router;
