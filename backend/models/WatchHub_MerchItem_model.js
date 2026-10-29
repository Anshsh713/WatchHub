const mongoose = require("mongoose");

const MerchItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: "₹",
    },
    imageUrl: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      enum: ["Amazon", "Flipkart", "Etsy", "Myntra", "WatchHub Store", "Other"],
      default: "Amazon",
    },
    buyUrl: {
      type: String,
      required: true,
    },
    mediaId: {
      type: String,
      required: true,
      index: true,
    },
    mediaTitle: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "Figures & Collectibles",
        "Apparel & Wearables",
        "Posters & Art",
        "Accessories",
        "Props & Replicas",
        "Books & Manga",
        "Other",
      ],
      default: "Figures & Collectibles",
    },
    condition: {
      type: String,
      enum: ["Brand New", "Like New", "Collector's Item", "Used - Good"],
      default: "Brand New",
    },
    badge: {
      type: String,
      default: "Official Merch",
    },
    rating: {
      type: Number,
      default: 4.6,
    },
    reviewsCount: {
      type: Number,
      default: 128,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WatchHub_User",
      default: null,
    },
    sellerName: {
      type: String,
      default: "Verified Merchant",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WatchHub_MerchItem", MerchItemSchema);
