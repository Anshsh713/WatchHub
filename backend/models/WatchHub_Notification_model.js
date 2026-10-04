const mongoose = require("mongoose");

const WatchHubNotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "follow",
        "club_invite",
        "club_post",
        "club_comment",
        "review_like",
        "review_reply",
        "collection_like",
        "system",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

WatchHubNotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports =
  mongoose.models.WatchHub_Notification ||
  mongoose.model("WatchHub_Notification", WatchHubNotificationSchema);
