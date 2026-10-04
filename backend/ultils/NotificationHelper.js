const WatchHub_Notification = require("../models/WatchHub_Notification_model");

exports.sendNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  data = {},
}) => {
  try {
    if (!recipient) return null;
    // Don't notify oneself
    if (sender && recipient.toString() === sender.toString()) {
      return null;
    }

    const notification = await WatchHub_Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      data,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};
