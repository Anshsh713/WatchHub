const router = require("express").Router();
const { getNews } = require("../controllers/NewsControllers");

router.get("/", getNews);

module.exports = router;
