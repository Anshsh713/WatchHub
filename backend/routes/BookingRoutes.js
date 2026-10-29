const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getTheatres,
} = require("../controllers/BookingControllers");
const { protect, optionalProtect } = require("../middleware/Protect");

router.get("/theatres", getTheatres);
router.post("/", optionalProtect, createBooking);
router.get("/my-bookings", optionalProtect, getMyBookings);
router.get("/:bookingId", optionalProtect, getBookingById);
router.patch("/:bookingId/cancel", optionalProtect, cancelBooking);

module.exports = router;
