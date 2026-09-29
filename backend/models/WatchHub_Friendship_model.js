const mongoose = require("mongoose");

const WatchHubFriendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// One friendship record between two users in one direction
WatchHubFriendshipSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.WatchHub_Friendship ||
  mongoose.model("WatchHub_Friendship", WatchHubFriendshipSchema);
