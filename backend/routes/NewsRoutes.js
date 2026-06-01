const router = require("express").Router();
const { getNews, getNewsDetails } = require("../controllers/NewsControllers");

router.get("/", getNews);
router.get("/:articleUrl", getNewsDetails);

module.exports = router;
