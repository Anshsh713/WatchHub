const mongoose = require("mongoose");

const WatchHubCollectionRatingSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One rating per user per collection
WatchHubCollectionRatingSchema.index(
  { user: 1, collectionId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.WatchHub_CollectionRating ||
  mongoose.model("WatchHub_CollectionRating", WatchHubCollectionRatingSchema);
