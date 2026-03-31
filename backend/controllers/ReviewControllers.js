const MediaReview = require("../models/Media_Reviews");
const User = require("../models/WatchHub_User_model");

exports.createReview = async (req, res) => {
  try {
    const { MediaID, MediaType, rating, comment, isSpoiler } = req.body;
    const userId = req.user._id;

    if (!MediaID || !MediaType || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingReview = await MediaReview.findOne({
      MediaID,
      User: userId,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.isSpoiler = isSpoiler;
      await existingReview.save();
      return res.json({
        message: "Review updated successfully",
        review: existingReview,
        isUpdate: true,
      });
    }

    const newReview = new MediaReview({
      MediaID,
      MediaType,
      User: userId,
      rating,
      isSpoiler,
      comment,
    });

    await newReview.save();
    return res.status(201).json({
      message: "Review created successfully",
      review: newReview,
      isUpdate: false,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReviewsStats = async (req, res) => {
  try {
    const { MediaID } = req.params;
    const total = await MediaReview.countDocuments({ MediaID });

    if (total === 0) {
      return res.json({ total: 0, stats: {} });
    }

    const aggregation = await MediaReview.aggregate([
      { $match: { MediaID } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const allRatings = ["Perfection", "Go for it", "TimePass", "Skip it"];
    const stats = {};

    allRatings.forEach((rating) => {
      const found = aggregation.find((a) => a._id === rating);
      stats[rating] = found ? Math.round((found.count / total) * 100) : 0;
    });

    res.json({ total, stats });
  } catch (error) {
    console.error("getReviewsStats error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.toggleLikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await MediaReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const alreadyLiked = review.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      review.likes = review.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      review.likes.push(userId);
    }

    await review.save();
    res.json({
      success: true,
      likesCount: review.likes.length,
      isLiked: review.likes.some((id) => id.toString() === userId.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment, replyingTo } = req.body;
    const userId = req.user._id;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment required" });
    }

    const review = await MediaReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const newReply = {
      user: userId,
      comment,
      replyingTo: replyingTo || null,
    };

    review.replies.push(newReply);

    await review.save();
    await review.populate("replies.user", "User_Name");

    res.json({
      success: true,
      replies: review.replies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLikeReply = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;
    const userId = req.user._id;

    const review = await MediaReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const reply = review.replies.id(replyId);

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

    await review.save();

    res.json({
      success: true,
      likesCount: reply.likes.length,
      isLiked: reply.likes.some((id) => id.toString() === userId.toString()),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await MediaReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.User.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: "Review deleted",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewsByMedia = async (req, res) => {
  try {
    const { MediaID } = req.params;
    const { page = 1, sort = "mostLiked", filter = "all" } = req.query;
    const userId = req.user?._id;

    const limit = 10;
    const skip = (page - 1) * limit;

    let query = { MediaID };

    if (filter === "byMe" && userId) {
      query.User = userId;
    }

    let pipeline = [
      { $match: query },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
    ];

    if (sort === "mostLiked") {
      pipeline.push({ $sort: { likesCount: -1 } });
    } else if (sort === "latest") {
      pipeline.push({ $sort: { createdAt: -1 } });
    } else if (sort === "oldest") {
      pipeline.push({ $sort: { createdAt: 1 } });
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

    let reviews = await MediaReview.aggregate(pipeline);

    reviews = reviews.map((review) => ({
      ...review,
      isLiked:
        userId && review.likes
          ? review.likes.some((id) => id.toString() === userId.toString())
          : false,
    }));

    const total = await MediaReview.countDocuments(query);

    res.json({
      reviews,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getReviewsByMedia error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
