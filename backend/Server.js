require("dotenv").config();
const express = require("express");
const WatchHub_Connect = require("./config/Database");
const cors = require("cors");
const UserRoutes = require("./routes/UserRoutes");
const MediaRoutes = require("./routes/MediaRoutes");
const ReviewsRoutes = require("./routes/ReviewsRoutes");
const WatchHub = express();

// ==========================
// Middlewares
// ==========================
WatchHub.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

WatchHub.use(express.json({ limit: "10mb" }));
WatchHub.use(express.urlencoded({ extended: true }));

/* ==========================
   ROUTES
========================== */
WatchHub.use("/api/user", UserRoutes);
WatchHub.use("/api", MediaRoutes);
WatchHub.use("/api/reviews", ReviewsRoutes);

WatchHub.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "WatchHub API is running",
  });
});

/* ==========================
   404 HANDLER
========================== */
WatchHub.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* ==========================
   GLOBAL ERROR HANDLER
========================== */
WatchHub.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ==========================
   SERVER START (DB First)
========================== */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await WatchHub_Connect();
    console.log("MongoDB Connected");

    const server = WatchHub.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    /* ==========================
       GRACEFUL SHUTDOWN
    ========================== */

    process.on("SIGINT", () => {
      console.log("Server shutting down...");
      server.close(() => {
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to connect DB:", error);
    process.exit(1);
  }
};

startServer();
