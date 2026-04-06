const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  title: String,
  genre: [String],
  country: String,
  language: String,
  familyFriendly: Boolean,
  awardWinning: Boolean,
  isAnime: Boolean,
  isFranchise: Boolean,
});
