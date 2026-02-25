const mongoose = require("mongoose");

const mediaReviewSchema = new mongoose.Schema(
  {
    MediaID: {
      type: String,
      required: true,
    },

    MediaType: {
      type: String,
      enum: ["movie", "tv", "anime"],
      required: true,
    },

    User: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      required: true,
    },

    rating: {
      type: String,
      required: true,
      enum: ["Perfection", "Go for it", "TimePass", "Skip it"],
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WatchHub_User",
      },
    ],

    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "WatchHub_User",
        },
        comment: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

mediaReviewSchema.index({ MediaID: 1, User: 1 }, { unique: true });

module.exports = mongoose.model("Media_Review", mediaReviewSchema);
