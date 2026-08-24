const mongoose = require("mongoose");

const WatchHubAnnouncementSchema = new mongoose.Schema(
  {
    mediaId: {
      type: Number,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["movie", "tv", "anime"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    posterPath: {
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
    },

    titleText: {
      type: String,
      required: true,
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

    isSpoiler: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "WatchHub_Announcement",
  WatchHubAnnouncementSchema,
);
