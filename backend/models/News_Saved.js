const mongoose = require("mongoose");

const SavedNewsSchema = new mongoose.Schema(
  {
    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },

    NewsID: {
      type: String,
      required: true,
    },

    Title: String,
    Description: String,
    Image: String,
    Source: String,
    Url: String,
    PublishedAt: Date,
    Category: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("SavedNews", SavedNewsSchema);
