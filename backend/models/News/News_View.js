const mongoose = require("mongoose");

const NewsViewSchema = new mongoose.Schema(
  {
    NewsID: {
      type: String,
      required: true,
    },

    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },
  },
  { timestamps: true },
);

NewsViewSchema.index(
  {
    NewsID: 1,
    User: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("NewsView", NewsViewSchema);
