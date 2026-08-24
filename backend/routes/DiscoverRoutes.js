const express = require("express");

const {
  getUpcoming,
  getReleaseCalendar,
  getUpcomingTrailers,
} = require("../controllers/Discover/DiscoverControllers");

const {
  getAnnouncements,
} = require("../controllers/Discover/AnnouncementControllers");

const router = express.Router();

router.get("/discover/upcoming", getUpcoming);

router.get("/discover/calendar", getReleaseCalendar);

router.get("/discover/trailers", getUpcomingTrailers);

router.get("/discover/announcements", getAnnouncements);

module.exports = router;
