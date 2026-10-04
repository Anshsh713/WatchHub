const mongoose = require("mongoose");

const ClubPostCommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WatchHub_User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const WatchHubClubPostSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_Club",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
      trim: true,
    },
    mediaAttachment: {
      tmdbId: { type: Number, default: null },
      mediaType: { type: String, enum: ["movie", "tv", "anime"], default: null },
      title: { type: String, default: null },
      posterPath: { type: String, default: null },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WatchHub_User",
      },
    ],
    comments: [ClubPostCommentSchema],
    commentsCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

WatchHubClubPostSchema.index({ club: 1, createdAt: -1 });

module.exports =
  mongoose.models.WatchHub_ClubPost ||
  mongoose.model("WatchHub_ClubPost", WatchHubClubPostSchema);
