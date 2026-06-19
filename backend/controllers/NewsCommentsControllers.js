const NewsComment = require("../models/News_Comments");
const User = require("../models/WatchHub_User_model");

exports.createComments = async (req, res) => {
  try {
    const { NewsID, comment } = req.body;
    const userId = req.user._id;

    if (!NewsID || !comment) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingComment = await NewsComment.findOne({
      NewsID,
      User: userId,
    });

    if (existingComment) {
      existingComment.comment = comment;

      await existingComment.save();

      return res.json({
        message: "Comment updated successfully",
        comment: existingComment,
        isUpdate: true,
      });
    }

    const newComment = new NewsComment({
      NewsID,
      User: userId,
      comment,
    });

    await newComment.save();

    return res.status(201).json({
      message: "Comment created successfully",
      comment: newComment,
      isUpdate: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.toggleLikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await NewsComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comments not found" });
    }

    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({
      success: true,
      likesCount: comment.likes.length,
      isLiked: comment.likes.some((id) => id.toString() === userId.toString()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment: replyText, replyingTo } = req.body;
    const userId = req.user._id;

    if (!replyText || replyText.trim() === "") {
      return res.status(400).json({
        message: "Comment required",
      });
    }

    const newsComment = await NewsComment.findById(commentId);

    if (!newsComment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const newReply = {
      user: userId,
      comment: replyText,
      replyingTo: replyingTo || null,
    };

    newsComment.replies.push(newReply);

    await newsComment.save();

    await newsComment.populate("replies.user", "User_Name");

    const repliesWithLikes = newsComment.replies.map((r) => {
      const replyObj = r.toObject ? r.toObject() : r;

      return {
        ...replyObj,
        likesCount: replyObj.likes?.length || 0,
        isLiked: replyObj.likes?.some(
          (id) => id.toString() === userId.toString(),
        ),
      };
    });

    return res.json({
      success: true,
      replies: repliesWithLikes,
    });
  } catch (error) {
    console.error("addReply error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.addReplyLike = async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    const userId = req.user._id;

    const comment = await NewsComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    const alreadyLiked = reply.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      reply.likes = reply.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      reply.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      likesCount: reply.likes.length,
      isLiked: reply.likes.some((id) => id.toString() === userId.toString()),
    });
  } catch (error) {
    console.error("addReplyLike error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await NewsComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.User.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("deleteComment error:", error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getCommentsByNews = async (req, res) => {
  try {
    const { NewsID } = req.params;
    const { page = 1, sort = "mostLiked", filter = "all" } = req.query;

    const userId = req.user?._id;

    const limit = 10;
    const skip = (page - 1) * limit;

    let query = { NewsID };

    if (filter === "byMe" && userId) {
      query.User = userId;
    }

    let pipeline = [
      {
        $match: query,
      },
      {
        $addFields: {
          likesCount: {
            $size: {
              $ifNull: ["$likes", []],
            },
          },
        },
      },
      {
        $addFields: {
          repliesCount: {
            $size: {
              $ifNull: ["$replies", []],
            },
          },
        },
      },
      {
        $project: {
          replies: 0,
        },
      },
    ];

    if (sort === "mostLiked") {
      pipeline.push({
        $sort: {
          likesCount: -1,
        },
      });
    } else if (sort === "latest") {
      pipeline.push({
        $sort: {
          createdAt: -1,
        },
      });
    } else if (sort === "oldest") {
      pipeline.push({
        $sort: {
          createdAt: 1,
        },
      });
    }

    pipeline.push({ $skip: skip }, { $limit: limit });

    pipeline.push(
      {
        $lookup: {
          from: "watchhub_users",
          localField: "User",
          foreignField: "_id",
          as: "User",
        },
      },
      {
        $unwind: {
          path: "$User",
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    let comments = await NewsComment.aggregate(pipeline);

    comments = comments.map((comment) => ({
      ...comment,
      isLiked:
        userId && comment.likes
          ? comment.likes.some((id) => id.toString() === userId.toString())
          : false,
    }));

    const total = await NewsComment.countDocuments(query);

    res.json({
      comments,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getCommentsByNews error:", error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await NewsComment.findById(commentId)
      .populate("replies.user", "User_Name")
      .lean();

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const replies = comment.replies.map((reply) => ({
      ...reply,
      likesCount: reply.likes?.length || 0,
    }));

    res.json({
      replies,
    });
  } catch (error) {
    console.error("getReplies error:", error);

    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
