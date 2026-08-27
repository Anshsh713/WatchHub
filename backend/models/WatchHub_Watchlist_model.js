const mongoose = require("mongoose");

const WatchHubWatchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },

    tmdbId: {
      type: Number,
      required: true,
      index: true,
    },

    mediaType: {
      type: String,
      enum: ["movie", "tv", "anime"],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    posterPath: {
      type: String,
      default: null,
    },

    backdropPath: {
      type: String,
      default: null,
    },

    releaseDate: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["want_to_watch", "watching", "completed", "on_hold", "dropped"],
      default: "want_to_watch",
      index: true,
    },

    personalRating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    addedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    watchedAt: {
      type: Date,
      default: null,
    },

    progress: {
      season: { type: Number, default: null },
      episode: { type: Number, default: null },
      percentage: { type: Number, default: null },
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index so each user can have a media item only once per media type
WatchHubWatchlistSchema.index(
  { user: 1, tmdbId: 1, mediaType: 1 },
  { unique: true },
);

module.exports =
  mongoose.models.WatchHub_Watchlist ||
  mongoose.model("WatchHub_Watchlist", WatchHubWatchlistSchema);
