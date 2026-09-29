const mongoose = require("mongoose");

const WatchHubCollectionReviewSchema = new mongoose.Schema(
  {
    user: {
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WatchHub_User",
      },
    ],
    unhelpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WatchHub_User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// One review per user per collection
WatchHubCollectionReviewSchema.index(
  { user: 1, collectionId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.WatchHub_CollectionReview ||
  mongoose.model("WatchHub_CollectionReview", WatchHubCollectionReviewSchema);
