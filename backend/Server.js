require("dotenv").config();
const express = require("express");
const WatchHub_Connect = require("./config/Database");
const cors = require("cors");
const UserRoutes = require("./routes/UserRoutes");
const MediaRoutes = require("./routes/MediaRoutes");
const ReviewsRoutes = require("./routes/ReviewsRoutes");
const NewsRoutes = require("./routes/NewsRoutes");
const CommentsRoutes = require("./routes/CommentsRoutes");
const Franchiseroutes = require("./routes/Franchiseroutes");
const { initializeAI } = require("./AI_ultils/spoilerDetector"); // Import AI Init
const WatchHub = express();

// Middlewares
WatchHub.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
WatchHub.use(express.json({ limit: "10mb" }));
WatchHub.use(express.urlencoded({ extended: true }));

// Routes
WatchHub.use("/api/user", UserRoutes);
WatchHub.use("/api", MediaRoutes);
WatchHub.use("/api/reviews", ReviewsRoutes);
WatchHub.use("/api/news", NewsRoutes);
WatchHub.use("/api/comments", CommentsRoutes);
WatchHub.use("/api/franchises", Franchiseroutes);

// Global Error Handler
WatchHub.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await WatchHub_Connect();
    console.log("✅ MongoDB Connected");

    // 2. Init AI (In API mode, this is instant)
    await initializeAI();

    // 3. Start Server
    const server = WatchHub.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on("SIGINT", () => {
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();
