const express = require("express");
const { optionalProtect } = require("../middleware/Protect");

const {
  getUpcoming,
  getReleaseCalendar,
  getUpcomingTrailers,
  getFranchiseUpdates,
  getTrendingDiscussions,
} = require("../controllers/Discover/DiscoverControllers");

const {
  getAnnouncements,
  getReleaseDateChanges,
  getVisualAnnouncements,
  seedAnnouncements,
} = require("../controllers/Discover/AnnouncementControllers");

const router = express.Router();

// Upcoming media
router.get("/discover/upcoming", getUpcoming);

// Release calendar
router.get("/discover/calendar", getReleaseCalendar);

// Video trailers
router.get("/discover/trailers", getUpcomingTrailers);

// Announcements & Industry news
router.get("/discover/announcements", getAnnouncements);

// Release date changes
router.get("/discover/release-date-changes", getReleaseDateChanges);

// Visuals (posters & first looks)
router.get("/discover/visuals", getVisualAnnouncements);

// Followed franchise updates
router.get("/discover/franchise-updates", optionalProtect, getFranchiseUpdates);

// Trending discussions
router.get("/discover/discussions", getTrendingDiscussions);

// Seeding endpoint
router.post("/discover/seed", seedAnnouncements);

module.exports = router;
