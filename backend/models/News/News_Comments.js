const mongoose = require("mongoose");

const NewsCommentSchema = new mongoose.Schema(
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
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true,
        },

        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "WatchHub_User",
          required: true,
        },

        comment: {
          type: String,
          required: true,
          maxlength: 1000,
        },

        replyingTo: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },

        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WatchHub_User",
          },
        ],

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("NewsComment", NewsCommentSchema);
