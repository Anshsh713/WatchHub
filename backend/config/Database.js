const mongoose = require("mongoose");

const WatchHub_Connect = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/WatchHub";
    // If URL uses localhost, replace with 127.0.0.1 on Windows to prevent IPv6 timeout
    const resolvedUrl = mongoUrl.replace("localhost", "127.0.0.1");
    await mongoose.connect(resolvedUrl);
    console.log("WatchHub Database is connected");
  } catch (error) {
    console.error("WatchHub Database Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = WatchHub_Connect;
