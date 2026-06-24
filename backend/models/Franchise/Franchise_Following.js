const mongoose = require("mongoose");

const FranchiseFollowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },

    franchise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FranchiseFollow", FranchiseFollowSchema);
