const mongoose = require("mongoose");

const FranchiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    description: String,

    logo: String,
    banner: String,

    sourceType: {
      type: String,
      enum: ["collection", "company", "keyword"],
      required: true,
    },

    tmdbCollectionId: Number,

    tmdbCompanyId: Number,

    keywords: [String],

    followers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Franchise", FranchiseSchema);
