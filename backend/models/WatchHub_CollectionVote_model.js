const mongoose = require("mongoose");

const WatchHubCollectionVoteSchema = new mongoose.Schema(
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
    voteType: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One vote per user per collection
WatchHubCollectionVoteSchema.index(
  { user: 1, collectionId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.WatchHub_CollectionVote ||
  mongoose.model("WatchHub_CollectionVote", WatchHubCollectionVoteSchema);
