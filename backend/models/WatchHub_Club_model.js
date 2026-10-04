const mongoose = require("mongoose");

const WatchHubClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: "General",
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    privacy: {
      type: String,
      enum: ["public", "private", "invite_only"],
      default: "public",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    rules: {
      type: [String],
      default: [
        "Be respectful to all club members.",
        "Use spoiler tags when discussing recent releases or plot twists.",
        "Keep discussions relevant to the club's theme.",
        "No spamming, self-promotion, or abusive behavior.",
      ],
    },
    membersCount: {
      type: Number,
      default: 1,
      index: true,
    },
    postsCount: {
      type: Number,
      default: 0,
      index: true,
    },
    featuredMedia: [
      {
        tmdbId: { type: Number, required: true },
        mediaType: { type: String, enum: ["movie", "tv", "anime"], required: true },
        title: { type: String, required: true },
        posterPath: { type: String, default: null },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for searching and sorting
WatchHubClubSchema.index({ name: "text", description: "text", tags: "text" });

module.exports =
  mongoose.models.WatchHub_Club ||
  mongoose.model("WatchHub_Club", WatchHubClubSchema);
