const mongoose = require("mongoose");

const collectionItemSchema = new mongoose.Schema(
  {
    tmdbId: {
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
    voteAverage: {
      type: Number,
      default: 0,
    },
    genres: {
      type: [String],
      default: [],
    },
    position: {
      type: Number,
      default: 0,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    note: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    noteIsPrivate: {
      type: Boolean,
      default: false,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const collaboratorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },
    role: {
      type: String,
      enum: ["editor", "viewer"],
      default: "editor",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WatchHubCollectionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
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
    type: {
      type: String,
      enum: ["movie", "tv", "anime", "mixed"],
      default: "mixed",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["private", "friends", "public"],
      default: "public",
      index: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    items: [collectionItemSchema],
    sections: [sectionSchema],
    collaborators: [collaboratorSchema],
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    allowCopy: {
      type: Boolean,
      default: true,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    stats: {
      movieCount: { type: Number, default: 0 },
      tvCount: { type: Number, default: 0 },
      animeCount: { type: Number, default: 0 },
      totalItems: { type: Number, default: 0 },
      averageTmdbRating: { type: Number, default: 0 },
    },
    engagement: {
      likes: { type: Number, default: 0, index: true },
      followers: { type: Number, default: 0, index: true },
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      reviews: { type: Number, default: 0, index: true },
      copies: { type: Number, default: 0, index: true },
    },
    averageRating: {
      type: Number,
      default: 0,
      index: true,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    voteScore: {
      type: Number,
      default: 0,
      index: true,
    },
    trendingScore: {
      type: Number,
      default: 0,
      index: true,
    },
    originalCollectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_Collection",
      default: null,
    },
    copiedFromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and search indexes
WatchHubCollectionSchema.index({ visibility: 1, type: 1, createdAt: -1 });
WatchHubCollectionSchema.index({ visibility: 1, averageRating: -1 });
WatchHubCollectionSchema.index({ visibility: 1, voteScore: -1 });
WatchHubCollectionSchema.index({ visibility: 1, trendingScore: -1 });
WatchHubCollectionSchema.index({ "collaborators.user": 1 });

// Recalculate stats helper on save
WatchHubCollectionSchema.methods.recalculateStats = function () {
  let movieCount = 0;
  let tvCount = 0;
  let animeCount = 0;
  let tmdbRatingSum = 0;
  let tmdbRatingCount = 0;

  this.items.forEach((item) => {
    if (item.mediaType === "movie") movieCount++;
    else if (item.mediaType === "tv") tvCount++;
    else if (item.mediaType === "anime") animeCount++;

    if (item.voteAverage && item.voteAverage > 0) {
      tmdbRatingSum += item.voteAverage;
      tmdbRatingCount++;
    }
  });

  this.stats = {
    movieCount,
    tvCount,
    animeCount,
    totalItems: this.items.length,
    averageTmdbRating:
      tmdbRatingCount > 0 ? Number((tmdbRatingSum / tmdbRatingCount).toFixed(1)) : 0,
  };

  const totalVotes = (this.engagement.upvotes || 0) + (this.engagement.downvotes || 0);
  if (totalVotes > 0) {
    this.voteScore = Number(
      (((this.engagement.upvotes || 0) / totalVotes) * 100).toFixed(1)
    );
  } else {
    this.voteScore = 0;
  }
};

module.exports =
  mongoose.models.WatchHub_Collection ||
  mongoose.model("WatchHub_Collection", WatchHubCollectionSchema);
