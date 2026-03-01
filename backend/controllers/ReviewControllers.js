const MediaReview = require("../models/Media_Reviews");
const User = require("../models/WatchHub_User_model");

exports.createReview = async (req, res) => {
  try {
    const { MediaID, MediaType, rating, comment } = req.body;
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
    res.status(500).json({ message: "Internal server error" });
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

    const alreadyLiked = review.likes.includes(userId);

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
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const review = await MediaReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.replies.push({
      User: userId,
      comment,
    });

    await review.save();

    res.json({
      success: true,
      replies: review.replies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await MediaReview.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.User.toString() !== userId) {
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

    const limit = 2;
    const skip = (page - 1) * limit;

    let query = { MediaID };

    if (filter === "byMe") {
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      query.User = req.user._id;
    }

    let sortOption = {};
    if (sort === "latest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const reviews = await MediaReview.aggregate([
      { $match: query },
      { $addFields: { likesCount: { $size: "$likes" } } },
      {
        $sort:
          sort === "mostLiked" ? { likesCount: -1, createdAt: -1 } : sortOption,
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "watchhub_users",
          localField: "User",
          foreignField: "_id",
          as: "User",
        },
      },
      { $unwind: "$User" },
    ]);

    const total = await MediaReview.countDocuments(query);

    res.json({
      reviews,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
