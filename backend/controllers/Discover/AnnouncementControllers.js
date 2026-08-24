const WatchHubAnnouncement = require("../../models/Accouncement_model");

exports.getAnnouncements = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (type) {
      filter.announcementType = type;
    }

    const announcements = await WatchHubAnnouncement.find(filter)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await WatchHubAnnouncement.countDocuments(filter);

    res.json({
      results: announcements,
      page: Number(page),
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Announcement Error:", error);

    res.status(500).json({
      message: "Failed to fetch announcements",
    });
  }
};
