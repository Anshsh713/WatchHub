const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema(
  {
    User_Email: {
      type: String,
      index: true,
    },

    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("WatchHub_Otp", OTPSchema);
