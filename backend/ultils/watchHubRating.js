const MediaReview = require("../models/Media_Reviews");

const RATING_COLORS = {
  Perfection: "#a855f7",
  "Go for it": "#00d284",
  TimePass: "#ffb703",
  "Skip it": "#ff6384",
};

const getWatchHubRatingMap = async (items) => {
  const mediaIds = Array.from(
    new Set((items || []).map((item) => item.id?.toString()).filter(Boolean)),
  );

  if (mediaIds.length === 0) {
    return {};
  }

  try {
    const aggregation = await MediaReview.aggregate([
      { $match: { MediaID: { $in: mediaIds } } },
      {
        $group: {
          _id: { mediaId: "$MediaID", rating: "$rating" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.mediaId",
          ratings: {
            $push: {
              rating: "$_id.rating",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
    ]);

    return aggregation.reduce((ratingMap, item) => {
      const total = item.total || 0;
      if (total === 0) {
        return ratingMap;
      }

      const perfectionItem = item.ratings?.find(
        (rating) => rating.rating === "Perfection",
      );
      const perfectionPercent = perfectionItem
        ? Math.round((perfectionItem.count / total) * 100)
        : 0;
      const highest = item.ratings?.reduce(
        (max, current) => (current.count > max.count ? current : max),
        item.ratings[0],
      );
      const dominantRating = highest ? highest.rating : "Perfection";

      ratingMap[item._id] = {
        total,
        perfection: perfectionPercent,
        dominantRating,
        dominantPercent: highest
          ? Math.round((highest.count / total) * 100)
          : perfectionPercent,
        color: RATING_COLORS[dominantRating] || "#a855f7",
      };

      return ratingMap;
    }, {});
  } catch (error) {
    console.error("Error aggregating WatchHub ratings:", error.message);
    return {};
  }
};

const addWatchHubRatings = async (items) => {
  const ratingMap = await getWatchHubRatingMap(items);

  return (items || []).map((item) => ({
    ...item,
    watchhub_rating: ratingMap[item.id?.toString()] || null,
  }));
};

module.exports = {
  getWatchHubRatingMap,
  addWatchHubRatings,
};
