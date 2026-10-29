const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      default: null,
    },
    guestInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
    },
    mediaId: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      default: "movie",
    },
    mediaTitle: {
      type: String,
      required: true,
    },
    mediaPoster: {
      type: String,
      default: "",
    },
    theatreId: {
      type: String,
      required: true,
    },
    theatreName: {
      type: String,
      required: true,
    },
    theatreLocation: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      address: { type: String, default: "" },
    },
    screen: {
      type: String,
      default: "Audi 1",
    },
    format: {
      type: String,
      default: "2D",
    },
    showDate: {
      type: String,
      required: true,
    },
    showTime: {
      type: String,
      required: true,
    },
    seats: [
      {
        seatNumber: { type: String, required: true },
        tier: { type: String, default: "Standard" },
        price: { type: Number, required: true },
      },
    ],
    snacks: [
      {
        id: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
      },
    ],
    convenienceFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "UPI",
    },
    paymentStatus: {
      type: String,
      enum: ["completed", "pending", "failed", "refunded"],
      default: "completed",
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchHub_Booking", BookingSchema);
