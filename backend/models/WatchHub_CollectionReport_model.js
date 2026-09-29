const mongoose = require("mongoose");

const WatchHubCollectionReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_Collection",
      required: true,
      index: true,
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_CollectionReview",
      default: null,
    },
    reason: {
      type: String,
      enum: [
        "Spam",
        "Harassment",
        "Copyright Abuse",
        "Sexual Content",
        "Hateful Content",
        "Misleading Content",
        "Other",
      ],
      required: true,
    },
    details: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.WatchHub_CollectionReport ||
  mongoose.model("WatchHub_CollectionReport", WatchHubCollectionReportSchema);
