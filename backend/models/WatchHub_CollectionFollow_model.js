const mongoose = require("mongoose");

const WatchHubCollectionFollowSchema = new mongoose.Schema(
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

// Unique compound index: One follow per user per collection
WatchHubCollectionFollowSchema.index(
  { user: 1, collectionId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.WatchHub_CollectionFollow ||
  mongoose.model("WatchHub_CollectionFollow", WatchHubCollectionFollowSchema);
