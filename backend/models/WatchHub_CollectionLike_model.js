const mongoose = require("mongoose");

const WatchHubCollectionLikeSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One like per user per collection
WatchHubCollectionLikeSchema.index(
  { user: 1, collectionId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.WatchHub_CollectionLike ||
  mongoose.model("WatchHub_CollectionLike", WatchHubCollectionLikeSchema);
