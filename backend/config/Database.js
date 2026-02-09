const mongoose = require("mongoose");

const WatchHub_Connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("WatchHub Database is connected");
  } catch (error) {
    console.error("WatchHub Database Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = WatchHub_Connect;
