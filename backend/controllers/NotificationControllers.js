const WatchHub_Notification = require("../models/WatchHub_Notification_model");

/*
|--------------------------------------------------------------------------
| 1. GET USER NOTIFICATIONS
|--------------------------------------------------------------------------
*/
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const [notifications, unreadCount] = await Promise.all([
      WatchHub_Notification.find({ recipient: userId })
        .populate("sender", "User_Name displayName avatar")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      WatchHub_Notification.countDocuments({ recipient: userId, read: false }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 2. MARK AS READ
|--------------------------------------------------------------------------
*/
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await WatchHub_Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true }
    );

    const unreadCount = await WatchHub_Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      unreadCount,
    });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 3. MARK ALL AS READ
|--------------------------------------------------------------------------
*/
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await WatchHub_Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 4. DELETE / CLEAR NOTIFICATIONS
|--------------------------------------------------------------------------
*/
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await WatchHub_Notification.findOneAndDelete({
      _id: id,
      recipient: userId,
    });

    const unreadCount = await WatchHub_Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      message: "Notification removed",
      unreadCount,
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await WatchHub_Notification.deleteMany({ recipient: userId });

    return res.status(200).json({
      success: true,
      message: "All notifications cleared",
      unreadCount: 0,
    });
  } catch (error) {
    console.error("CLEAR ALL NOTIFICATIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear notifications",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 5. SEED INITIAL SAMPLE NOTIFICATIONS (Convenience for fresh accounts)
|--------------------------------------------------------------------------
*/
exports.seedSampleNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await WatchHub_Notification.countDocuments({ recipient: userId });

    if (count === 0) {
      await WatchHub_Notification.insertMany([
        {
          recipient: userId,
          type: "system",
          title: "Welcome to WatchHub!",
          message: "Explore trending movies, create custom collections, and customize your profile dashboard.",
          link: "/profile",
          read: false,
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          recipient: userId,
          type: "club_invite",
          title: "Join Community Clubs",
          message: "Check out anime, sci-fi, and cinema clubs to discuss your favorite media.",
          link: "/clubs",
          read: false,
          createdAt: new Date(Date.now() - 1800000),
        },
      ]);
    }

    const [notifications, unreadCount] = await Promise.all([
      WatchHub_Notification.find({ recipient: userId })
        .populate("sender", "User_Name displayName avatar")
        .sort({ createdAt: -1 })
        .lean(),
      WatchHub_Notification.countDocuments({ recipient: userId, read: false }),
    ]);

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("SEED NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ success: false, message: "Seed failed" });
  }
};
