const mongoose = require("mongoose");

const WatchHubAnnouncementSchema = new mongoose.Schema(
  {
    mediaId: {
      type: Number,
      required: true,
      index: true,
    },

    mediaType: {
      type: String,
      enum: ["movie", "tv", "anime"],
      required: true,
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

    bannerPath: {
      type: String,
      default: null,
    },

    announcementType: {
      type: String,
      enum: [
        "movie_announced",
        "release_date",
        "release_date_changed",
        "trailer",
        "teaser",
        "poster",
        "first_look",
        "casting",
        "new_season",
        "renewed",
        "cancelled",
        "production_started",
        "production_wrapped",
      ],
      required: true,
      index: true,
    },

    titleText: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    trailerKey: {
      type: String,
      default: null,
    },

    releaseDate: {
      type: Date,
      default: null,
    },

    previousReleaseDate: {
      type: Date,
      default: null,
    },

    changeStatus: {
      type: String,
      enum: ["Delayed", "Moved Earlier", "Date TBA", null],
      default: null,
    },

    isSpoiler: {
      type: Boolean,
      default: false,
    },

    franchiseSlug: {
      type: String,
      default: null,
      index: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.WatchHub_Announcement ||
  mongoose.model("WatchHub_Announcement", WatchHubAnnouncementSchema);
