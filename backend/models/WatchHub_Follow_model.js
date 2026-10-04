const mongoose = require("mongoose");

const WatchHubFollowSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate follows
WatchHubFollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports =
  mongoose.models.WatchHub_Follow ||
  mongoose.model("WatchHub_Follow", WatchHubFollowSchema);
