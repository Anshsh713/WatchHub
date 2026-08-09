const mongoose = require("mongoose");

const FranchiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    // Primary source shown in the UI
    sourceType: {
      type: String,
      enum: ["collection", "company", "keyword"],
      required: true,
    },

    // Existing fields
    tmdbCollectionId: {
      type: Number,
      default: null,
    },

    tmdbCompanyId: {
      type: Number,
      default: null,
    },

    keywords: {
      type: [String],
      default: [],
    },

    followers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Franchise", FranchiseSchema);
