const mongoose = require("mongoose");

const NewsReactionSchema = new mongoose.Schema(
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

    ReactionType: {
      type: String,
      enum: ["like", "hype", "shocked", "sad"],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("NewsReaction", NewsReactionSchema);
