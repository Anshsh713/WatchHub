const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  seedSampleNotifications,
} = require("../controllers/NotificationControllers");

const { protect } = require("../middleware/Protect");

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);
router.delete("/clear-all", protect, clearAllNotifications);
router.delete("/:id", protect, deleteNotification);
router.post("/test-seed", protect, seedSampleNotifications);

module.exports = router;
