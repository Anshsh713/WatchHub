const mongoose = require("mongoose");

const WatchHubClubMemberSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_Club",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "moderator", "member"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "pending", "banned"],
      default: "active",
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One membership per user per club
WatchHubClubMemberSchema.index({ club: 1, user: 1 }, { unique: true });

module.exports =
  mongoose.models.WatchHub_ClubMember ||
  mongoose.model("WatchHub_ClubMember", WatchHubClubMemberSchema);
