const mongoose = require("mongoose");

const WatchHubCollectionActivitySchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_Collection",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        "created",
        "media_added",
        "media_removed",
        "section_created",
        "followed",
        "reviewed",
        "copied",
      ],
      required: true,
    },
    meta: {
      mediaTitle: { type: String, default: null },
      mediaType: { type: String, default: null },
      sectionName: { type: String, default: null },
      rating: { type: Number, default: null },
      details: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

WatchHubCollectionActivitySchema.index({ collectionId: 1, createdAt: -1 });

module.exports =
  mongoose.models.WatchHub_CollectionActivity ||
  mongoose.model(
    "WatchHub_CollectionActivity",
    WatchHubCollectionActivitySchema
  );
