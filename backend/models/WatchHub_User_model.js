const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    User_Name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    User_Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    User_Password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    Role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Profile Customization
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    bannerImage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    socialLinks: {
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      discord: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    favoriteMediaTypes: {
      type: [String],
      default: ["movie", "tv", "anime"],
    },
    favoriteFranchises: {
      type: [String],
      default: [],
    },
    favoriteMedia: [
      {
        tmdbId: { type: Number, required: true },
        mediaType: { type: String, enum: ["movie", "tv", "anime"], required: true },
        title: { type: String, required: true },
        posterPath: { type: String, default: null },
        releaseDate: { type: String, default: null },
        voteAverage: { type: Number, default: 0 },
      },
    ],

    // Privacy Controls
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "followers", "private"],
        default: "public",
      },
      showWatchlist: { type: Boolean, default: true },
      showWatchActivity: { type: Boolean, default: true },
      showCollections: { type: Boolean, default: true },
      showReviews: { type: Boolean, default: true },
      showRatings: { type: Boolean, default: true },
      showLikes: { type: Boolean, default: true },
      showClubs: { type: Boolean, default: true },
      showFollowers: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true },
      allowDirectMessages: { type: Boolean, default: true },
    },

    // User Settings
    settings: {
      appearance: {
        theme: {
          type: String,
          enum: ["dark", "cinema", "midnight", "amoled"],
          default: "dark",
        },
        accentColor: { type: String, default: "#e50914" },
        compactMode: { type: Boolean, default: false },
      },
      notifications: {
        emailAlerts: { type: Boolean, default: true },
        newFollowers: { type: Boolean, default: true },
        clubInvites: { type: Boolean, default: true },
        clubPosts: { type: Boolean, default: true },
        reviewLikes: { type: Boolean, default: true },
        replies: { type: Boolean, default: true },
        watchlistReleases: { type: Boolean, default: true },
      },
      content: {
        matureContent: { type: Boolean, default: false },
        spoilerBlur: { type: Boolean, default: true },
        defaultHomeTab: { type: String, default: "trending" },
        preferredLanguages: { type: [String], default: ["en"] },
      },
      playback: {
        autoplayTrailers: { type: Boolean, default: true },
        defaultQuality: {
          type: String,
          enum: ["auto", "1080p", "720p", "480p"],
          default: "auto",
        },
        soundEffects: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("WatchHub_User", UserSchema);
