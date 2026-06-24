const User = require("../models/WatchHub_User_model");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.Role !== "admin") {
      return res.status(403).json({
        message: "Only admins can access this",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = adminMiddleware;
