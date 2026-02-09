const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    User_Name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    User_Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    User_Password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("WatchHub_User", UserSchema);
