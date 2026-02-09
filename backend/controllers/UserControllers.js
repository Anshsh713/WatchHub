const WatchHub_User = require("../models/WatchHub_User_model");
const WatchHub_Otp = require("../models/OTP_model");
const bcrypt = require("bcryptjs");
const sendOTP = require("../ultils/SendOTP");
const jwt = require("jsonwebtoken");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.DeletingOTP = async (req, res) => {
  try {
    const { User_Email } = req.body;

    if (!User_Email) {
      return res.status(400).json({
        message: "Email is Required",
      });
    }

    await WatchHub_Otp.deleteMany({
      User_Email,
      purpose: "email_verification",
    });

    return res.status(201).json({
      message: "Done",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

exports.Signing_Up_Requesting = async (req, res) => {
  try {
    const { User_Name, User_Email, User_Password } = req.body;

    if (!User_Email || !User_Name || !User_Password) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }

    const existingUser = await WatchHub_User.findOne({ User_Email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const existingUserName = await WatchHub_User.findOne({ User_Name });
    if (existingUserName) {
      return res.status(400).json({
        message: "User Name already Taken",
      });
    }

    await WatchHub_Otp.deleteMany({
      User_Email,
      purpose: "email_verification",
    });

    const OTP = generateOTP();
    const OTPHash = await bcrypt.hash(OTP, 10);

    const otprecord = await WatchHub_Otp.create({
      User_Email,
      otpHash: OTPHash,
      purpose: "email_verification",
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    try {
      await sendOTP(User_Email, OTP, "Email Verification");
    } catch (error) {
      await WatchHub_Otp.deleteOne({ _id: otprecord._id });

      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    return res.status(201).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.Signing_Up_Verifying = async (req, res) => {
  try {
    const { User_Name, User_Email, User_Password, otp } = req.body;

    if (!User_Name || !User_Email || !User_Password || !otp) {
      return res.status(400).json({
        message: "Email, password and OTP are required",
      });
    }

    const otpRecord = await WatchHub_Otp.findOne({
      User_Email,
      purpose: "email_verification",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or already Used",
      });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await WatchHub_Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otpRecord.attempts >= 5) {
      await WatchHub_Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "Too many invalid attempts. Please request a new OTP.",
      });
    }

    const isValidOTP = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValidOTP) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(User_Password, 10);

    const User = await WatchHub_User.create({
      User_Name: User_Name || "User",
      User_Email,
      User_Password: hashedPassword,
    });

    await WatchHub_Otp.deleteOne({ _id: otpRecord._id });

    const token = jwt.sign({ id: User._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: User._id,
        User_Name: User.User_Name,
        User_Email: User.User_Email,
      },
    });
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    return res.status(500).json({
      message: "Signup verification failed",
    });
  }
};

exports.Password_Reseting_Requesting = async (req, res) => {
  try {
    const { User_Email } = req.body;

    if (!User_Email) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }

    const existingUser = await WatchHub_User.findOne({ User_Email });
    if (!existingUser) {
      return res.status(400).json({
        message: "User does not exits",
      });
    }

    await WatchHub_Otp.deleteMany({
      User_Email,
      purpose: "password_reset",
    });

    const OTP = generateOTP();

    const OTPHash = await bcrypt.hash(OTP, 10);

    const otprecord = await WatchHub_Otp.create({
      User_Email,
      otpHash: OTPHash,
      purpose: "password_reset",
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    try {
      await sendOTP(User_Email, OTP, "Password Reset");
    } catch (error) {
      await WatchHub_Otp.deleteOne({ _id: otprecord._id });

      return res.status(500).json({
        message: "Failed to send OTP",
      });
    }

    return res.status(201).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.Password_Reseting_Verifying = async (req, res) => {
  try {
    const { User_Email, OTP } = req.body;

    if (!User_Email || !OTP) {
      return res.status(400).json({
        message: "OTP are required",
      });
    }

    const otpRecord = await WatchHub_Otp.findOne({
      User_Email,
      purpose: "password_reset",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found or already Used",
      });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await WatchHub_Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otpRecord.attempts >= 5) {
      await WatchHub_Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        message: "Too many invalid attempts. Please request a new OTP.",
      });
    }

    const isValidOTP = await bcrypt.compare(OTP, otpRecord.otpHash);

    if (!isValidOTP) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    await WatchHub_Otp.deleteOne({ _id: otpRecord._id });

    return res.status(201).json({
      message: "OTP verified",
    });
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
};

exports.Password_Reseting = async (req, res) => {
  try {
    const { User_Email, New_Password } = req.body;

    if (!User_Email || !New_Password) {
      return res.status(400).json({
        message: "Password are required",
      });
    }

    const hashedPassword = await bcrypt.hash(New_Password, 10);

    await WatchHub_User.findOneAndUpdate(
      { User_Email },
      { User_Password: hashedPassword },
    );

    return res.status(201).json({
      message: "Password Reset successfully",
    });
  } catch (error) {
    console.error("Password reseting ERROR:", error);
    return res.status(500).json({
      message: "Password reseting failed",
    });
  }
};

exports.Login = async (req, res) => {
  try {
    const { User_Email, User_Password } = req.body;

    if (!User_Email || !User_Password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await WatchHub_User.findOne({ User_Email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(User_Password, user.User_Password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        User_Name: user.User_Name,
        User_Email: user.User_Email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

exports.GetMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("GETME ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};
