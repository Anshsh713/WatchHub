const WatchHub_User = require("../models/WatchHub_User_model");
const WatchHub_Otp = require("../models/OTP_model");
const WatchHub_Follow = require("../models/WatchHub_Follow_model");
const WatchHub_Club = require("../models/WatchHub_Club_model");
const WatchHub_ClubMember = require("../models/WatchHub_ClubMember_model");
const WatchHub_Watchlist = require("../models/WatchHub_Watchlist_model");
const WatchHub_Collection = require("../models/WatchHub_Collection_model");
const MediaReview = require("../models/Media_Reviews");
const { sendNotification } = require("../ultils/NotificationHelper");
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

/*
|--------------------------------------------------------------------------
| HELPER: Find user by ID or Username
|--------------------------------------------------------------------------
*/
const findUserByIdentifier = async (identifier) => {
  if (!identifier) return null;
  if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
    const userById = await WatchHub_User.findById(identifier);
    if (userById) return userById;
  }
  return await WatchHub_User.findOne({
    User_Name: { $regex: new RegExp(`^${identifier.trim()}$`, "i") },
  });
};

/*
|--------------------------------------------------------------------------
| 1. GET USER PROFILE & DASHBOARD OVERVIEW
|--------------------------------------------------------------------------
*/
exports.GetUserProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    let targetUser;

    if (!identifier || identifier === "me") {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }
      targetUser = req.user;
    } else {
      targetUser = await findUserByIdentifier(identifier);
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;
    const isSelf = viewerId && viewerId.toString() === targetUser._id.toString();

    let isFollowing = false;
    if (viewerId && !isSelf) {
      const followExists = await WatchHub_Follow.exists({
        follower: viewerId,
        following: targetUser._id,
      });
      isFollowing = Boolean(followExists);
    }

    // Privacy logic
    const privacy = targetUser.privacy || {
      profileVisibility: "public",
      showWatchlist: true,
      showWatchActivity: true,
      showCollections: true,
      showReviews: true,
      showRatings: true,
      showLikes: true,
      showClubs: true,
      showFollowers: true,
      showStats: true,
      allowDirectMessages: true,
    };

    const isRestricted =
      !isSelf &&
      (privacy.profileVisibility === "private" ||
        (privacy.profileVisibility === "followers" && !isFollowing));

    // Follower and count aggregations
    const [followersCount, followingCount, clubsCount, collectionsCount] =
      await Promise.all([
        WatchHub_Follow.countDocuments({ following: targetUser._id }),
        WatchHub_Follow.countDocuments({ follower: targetUser._id }),
        WatchHub_ClubMember.countDocuments({
          user: targetUser._id,
          status: "active",
        }),
        WatchHub_Collection.countDocuments({
          owner: targetUser._id,
          ...(isSelf ? {} : { visibility: "public" }),
        }),
      ]);

    const publicUserData = {
      _id: targetUser._id,
      id: targetUser._id,
      User_Name: targetUser.User_Name,
      username: targetUser.User_Name,
      displayName: targetUser.displayName || targetUser.User_Name,
      email: isSelf ? targetUser.User_Email : undefined,
      bio: targetUser.bio || "",
      avatar: targetUser.avatar || "",
      bannerImage: targetUser.bannerImage || "",
      location: targetUser.location || "",
      website: targetUser.website || "",
      socialLinks: targetUser.socialLinks || {},
      favoriteGenres: targetUser.favoriteGenres || [],
      favoriteMediaTypes: targetUser.favoriteMediaTypes || ["movie", "tv", "anime"],
      favoriteFranchises: targetUser.favoriteFranchises || [],
      favoriteMedia: targetUser.favoriteMedia || [],
      createdAt: targetUser.createdAt,
      role: targetUser.Role,
      followersCount,
      followingCount,
      clubsCount,
      collectionsCount,
      isFollowing,
      isSelf,
      isRestricted,
      privacy: isSelf ? privacy : { profileVisibility: privacy.profileVisibility },
      settings: isSelf ? targetUser.settings : undefined,
    };

    if (isRestricted) {
      return res.status(200).json({
        success: true,
        user: publicUserData,
        isPrivate: true,
        overview: null,
      });
    }

    // Full overview dashboard data
    const allWatchlist = await WatchHub_Watchlist.find({
      user: targetUser._id,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const movieCount = allWatchlist.filter((i) => i.mediaType === "movie").length;
    const tvCount = allWatchlist.filter((i) => i.mediaType === "tv").length;
    const animeCount = allWatchlist.filter((i) => i.mediaType === "anime").length;
    const completedCount = allWatchlist.filter((i) => i.status === "completed").length;
    const watchingCount = allWatchlist.filter((i) => i.status === "watching").length;
    const wantToWatchCount = allWatchlist.filter((i) => i.status === "want_to_watch").length;

    const ratedItems = allWatchlist.filter(
      (i) => i.personalRating !== null && i.personalRating !== undefined && i.personalRating > 0
    );
    const averageRating =
      ratedItems.length > 0
        ? Number(
            (
              ratedItems.reduce((acc, curr) => acc + curr.personalRating, 0) /
              ratedItems.length
            ).toFixed(1)
          )
        : 0;

    // Realistic hours calculation
    let calculatedHours = 0;
    allWatchlist.forEach((item) => {
      if (item.status === "completed") {
        if (item.mediaType === "movie") calculatedHours += 2;
        else if (item.mediaType === "tv") {
          calculatedHours += (item.progress?.episode || 10) * 0.75;
        } else if (item.mediaType === "anime") {
          calculatedHours += (item.progress?.episode || 12) * 0.4;
        }
      } else if (item.status === "watching") {
        if (item.mediaType === "movie") calculatedHours += 1;
        else if (item.mediaType === "tv") {
          calculatedHours += (item.progress?.episode || 3) * 0.75;
        } else if (item.mediaType === "anime") {
          calculatedHours += (item.progress?.episode || 4) * 0.4;
        }
      }
    });

    const watchStatistics = {
      movies: movieCount,
      tvShows: tvCount,
      anime: animeCount,
      totalTitles: allWatchlist.length,
      completedTitles: completedCount,
      watchingTitles: watchingCount,
      wantToWatchTitles: wantToWatchCount,
      ratedTitles: ratedItems.length,
      averageRating,
      hoursWatched: Math.max(1, Math.round(calculatedHours)),
      completionRate:
        allWatchlist.length > 0
          ? Math.round((completedCount / allWatchlist.length) * 100)
          : 0,
    };

    // Filter overview sections according to user's privacy controls
    const showWatchlist = isSelf || privacy.showWatchlist;
    const showReviews = isSelf || privacy.showReviews;
    const showCollections = isSelf || privacy.showCollections;
    const showClubs = isSelf || privacy.showClubs;
    const showStats = isSelf || privacy.showStats;
    const showActivity = isSelf || privacy.showWatchActivity;

    const currentlyWatching = showWatchlist
      ? allWatchlist.filter((i) => i.status === "watching").slice(0, 10)
      : [];

    const recentlyWatched = showWatchlist
      ? allWatchlist
          .filter((i) => i.status === "completed" || i.watchedAt)
          .sort(
            (a, b) =>
              new Date(b.watchedAt || b.updatedAt) -
              new Date(a.watchedAt || a.updatedAt)
          )
          .slice(0, 10)
      : [];

    const recentlyCompleted = showWatchlist
      ? allWatchlist.filter((i) => i.status === "completed").slice(0, 10)
      : [];

    // Favorite media
    let favoriteMedia = targetUser.favoriteMedia || [];
    if (favoriteMedia.length === 0 && showWatchlist) {
      favoriteMedia = ratedItems
        .sort((a, b) => (b.personalRating || 0) - (a.personalRating || 0))
        .slice(0, 8)
        .map((item) => ({
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          releaseDate: item.releaseDate,
          voteAverage: item.personalRating,
        }));
    }

    // Recent reviews
    let recentReviews = [];
    if (showReviews) {
      recentReviews = await MediaReview.find({ User: targetUser._id })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
    }

    // Recent collections
    let recentCollections = [];
    if (showCollections) {
      recentCollections = await WatchHub_Collection.find({
        owner: targetUser._id,
        ...(isSelf ? {} : { visibility: "public" }),
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();
    }

    // Joined clubs
    let joinedClubs = [];
    if (showClubs) {
      const clubMemberships = await WatchHub_ClubMember.find({
        user: targetUser._id,
        status: "active",
      })
        .populate("club")
        .limit(8)
        .lean();
      joinedClubs = clubMemberships
        .map((m) => m.club)
        .filter(Boolean);
    }

    // Recent activity stream
    let recentActivity = [];
    if (showActivity) {
      allWatchlist.slice(0, 8).forEach((item) => {
        recentActivity.push({
          id: `watch-${item._id}`,
          type: item.status === "completed" ? "completed" : item.status === "watching" ? "watching" : "added",
          title: item.title,
          mediaType: item.mediaType,
          tmdbId: item.tmdbId,
          posterPath: item.posterPath,
          date: item.watchedAt || item.updatedAt || item.createdAt,
          details: item.personalRating ? `Rated ${item.personalRating}/10` : `Marked as ${item.status.replace(/_/g, " ")}`,
        });
      });

      recentReviews.slice(0, 4).forEach((rev) => {
        recentActivity.push({
          id: `rev-${rev._id}`,
          type: "review",
          title: `Reviewed a ${rev.MediaType}`,
          mediaType: rev.MediaType,
          tmdbId: rev.MediaID,
          date: rev.createdAt,
          details: `Rated "${rev.rating}": "${rev.comment?.slice(0, 60)}..."`,
        });
      });

      recentCollections.slice(0, 4).forEach((col) => {
        recentActivity.push({
          id: `col-${col._id}`,
          type: "collection",
          title: col.name,
          details: `Created collection with ${col.stats?.totalItems || col.items?.length || 0} items`,
          date: col.createdAt,
          slug: col.slug,
        });
      });

      recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
      recentActivity = recentActivity.slice(0, 15);
    }

    return res.status(200).json({
      success: true,
      user: publicUserData,
      isPrivate: false,
      overview: {
        currentlyWatching,
        recentlyWatched,
        recentlyCompleted,
        favoriteMedia,
        recentReviews,
        recentCollections,
        joinedClubs,
        recentActivity,
        watchStatistics: showStats ? watchStatistics : null,
      },
    });
  } catch (error) {
    console.error("GET USER PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user profile",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 2. UPDATE PROFILE CUSTOMIZATION
|--------------------------------------------------------------------------
*/
exports.UpdateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      displayName,
      username,
      bio,
      avatar,
      bannerImage,
      location,
      website,
      socialLinks,
      favoriteGenres,
      favoriteMediaTypes,
      favoriteFranchises,
      favoriteMedia,
    } = req.body;

    const user = await WatchHub_User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Username update validation
    if (username && username.trim() !== user.User_Name) {
      const cleanUsername = username.trim().replace(/\s+/g, "");
      const existing = await WatchHub_User.findOne({
        User_Name: { $regex: new RegExp(`^${cleanUsername}$`, "i") },
        _id: { $ne: userId },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Username already taken. Please choose another.",
        });
      }
      user.User_Name = cleanUsername;
    }

    if (displayName !== undefined) user.displayName = displayName.trim();
    if (bio !== undefined) user.bio = bio.trim().slice(0, 500);
    if (avatar !== undefined) user.avatar = avatar;
    if (bannerImage !== undefined) user.bannerImage = bannerImage;
    if (location !== undefined) user.location = location.trim();
    if (website !== undefined) user.website = website.trim();
    if (socialLinks !== undefined) {
      user.socialLinks = {
        twitter: socialLinks.twitter || "",
        instagram: socialLinks.instagram || "",
        youtube: socialLinks.youtube || "",
        discord: socialLinks.discord || "",
        github: socialLinks.github || "",
      };
    }
    if (favoriteGenres !== undefined) user.favoriteGenres = favoriteGenres;
    if (favoriteMediaTypes !== undefined) user.favoriteMediaTypes = favoriteMediaTypes;
    if (favoriteFranchises !== undefined) user.favoriteFranchises = favoriteFranchises;
    if (favoriteMedia !== undefined) user.favoriteMedia = favoriteMedia;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        _id: user._id,
        User_Name: user.User_Name,
        username: user.User_Name,
        displayName: user.displayName || user.User_Name,
        bio: user.bio,
        avatar: user.avatar,
        bannerImage: user.bannerImage,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        favoriteGenres: user.favoriteGenres,
        favoriteMediaTypes: user.favoriteMediaTypes,
        favoriteFranchises: user.favoriteFranchises,
        favoriteMedia: user.favoriteMedia,
        privacy: user.privacy,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error("UPDATE USER PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 3. GET / UPDATE USER SETTINGS
|--------------------------------------------------------------------------
*/
exports.GetUserSettings = async (req, res) => {
  try {
    const user = await WatchHub_User.findById(req.user._id).select(
      "-User_Password"
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      settings: user.settings || {},
      privacy: user.privacy || {},
      profile: {
        displayName: user.displayName,
        username: user.User_Name,
        email: user.User_Email,
        bio: user.bio,
        avatar: user.avatar,
        bannerImage: user.bannerImage,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        favoriteGenres: user.favoriteGenres,
        favoriteMediaTypes: user.favoriteMediaTypes,
        favoriteFranchises: user.favoriteFranchises,
      },
    });
  } catch (error) {
    console.error("GET USER SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};

exports.UpdateUserSettings = async (req, res) => {
  try {
    const { settings, privacy } = req.body;
    const user = await WatchHub_User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (privacy) {
      user.privacy = {
        ...user.privacy.toObject(),
        ...privacy,
      };
    }

    if (settings) {
      if (settings.appearance) {
        user.settings.appearance = {
          ...user.settings.appearance.toObject(),
          ...settings.appearance,
        };
      }
      if (settings.notifications) {
        user.settings.notifications = {
          ...user.settings.notifications.toObject(),
          ...settings.notifications,
        };
      }
      if (settings.content) {
        user.settings.content = {
          ...user.settings.content.toObject(),
          ...settings.content,
        };
      }
      if (settings.playback) {
        user.settings.playback = {
          ...user.settings.playback.toObject(),
          ...settings.playback,
        };
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: user.settings,
      privacy: user.privacy,
    });
  } catch (error) {
    console.error("UPDATE USER SETTINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update settings",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 4. CHANGE PASSWORD
|--------------------------------------------------------------------------
*/
exports.ChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await WatchHub_User.findById(userId);
    const isMatch = await bcrypt.compare(currentPassword, user.User_Password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.User_Password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 5. FOLLOW / UNFOLLOW SYSTEM
|--------------------------------------------------------------------------
*/
exports.FollowUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { targetUserId } = req.params;

    const targetUser = await findUserByIdentifier(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    if (followerId.toString() === targetUser._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const existingFollow = await WatchHub_Follow.findOne({
      follower: followerId,
      following: targetUser._id,
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "Already following this user",
        isFollowing: true,
      });
    }

    await WatchHub_Follow.create({
      follower: followerId,
      following: targetUser._id,
    });

    // Send notification
    await sendNotification({
      recipient: targetUser._id,
      sender: followerId,
      type: "follow",
      title: "New Follower",
      message: `@${req.user.User_Name} started following you on WatchHub!`,
      link: `/profile/${req.user.User_Name}`,
    });

    const followersCount = await WatchHub_Follow.countDocuments({
      following: targetUser._id,
    });

    return res.status(200).json({
      success: true,
      message: `Now following @${targetUser.User_Name}`,
      isFollowing: true,
      followersCount,
    });
  } catch (error) {
    console.error("FOLLOW USER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to follow user",
    });
  }
};

exports.UnfollowUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { targetUserId } = req.params;

    const targetUser = await findUserByIdentifier(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    await WatchHub_Follow.findOneAndDelete({
      follower: followerId,
      following: targetUser._id,
    });

    const followersCount = await WatchHub_Follow.countDocuments({
      following: targetUser._id,
    });

    return res.status(200).json({
      success: true,
      message: `Unfollowed @${targetUser.User_Name}`,
      isFollowing: false,
      followersCount,
    });
  } catch (error) {
    console.error("UNFOLLOW USER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unfollow user",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 6. GET FOLLOWERS & FOLLOWING LISTS
|--------------------------------------------------------------------------
*/
exports.GetUserFollowers = async (req, res) => {
  try {
    const { identifier } = req.params;
    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;

    const follows = await WatchHub_Follow.find({ following: targetUser._id })
      .populate("follower", "User_Name displayName avatar bio")
      .sort({ createdAt: -1 })
      .lean();

    // Map each follower with follow-back status
    const followers = await Promise.all(
      follows
        .filter((f) => f.follower)
        .map(async (f) => {
          let viewerFollows = false;
          if (viewerId) {
            viewerFollows = Boolean(
              await WatchHub_Follow.exists({
                follower: viewerId,
                following: f.follower._id,
              })
            );
          }
          return {
            _id: f.follower._id,
            id: f.follower._id,
            username: f.follower.User_Name,
            displayName: f.follower.displayName || f.follower.User_Name,
            avatar: f.follower.avatar || "",
            bio: f.follower.bio || "",
            followedAt: f.createdAt,
            isFollowing: viewerFollows,
            isSelf: viewerId && viewerId.toString() === f.follower._id.toString(),
          };
        })
    );

    return res.status(200).json({
      success: true,
      followers,
      count: followers.length,
    });
  } catch (error) {
    console.error("GET FOLLOWERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch followers",
    });
  }
};

exports.GetUserFollowing = async (req, res) => {
  try {
    const { identifier } = req.params;
    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;

    const follows = await WatchHub_Follow.find({ follower: targetUser._id })
      .populate("following", "User_Name displayName avatar bio")
      .sort({ createdAt: -1 })
      .lean();

    const following = await Promise.all(
      follows
        .filter((f) => f.following)
        .map(async (f) => {
          let viewerFollows = false;
          if (viewerId) {
            viewerFollows = Boolean(
              await WatchHub_Follow.exists({
                follower: viewerId,
                following: f.following._id,
              })
            );
          }
          return {
            _id: f.following._id,
            id: f.following._id,
            username: f.following.User_Name,
            displayName: f.following.displayName || f.following.User_Name,
            avatar: f.following.avatar || "",
            bio: f.following.bio || "",
            followedAt: f.createdAt,
            isFollowing: viewerFollows,
            isSelf: viewerId && viewerId.toString() === f.following._id.toString(),
          };
        })
    );

    return res.status(200).json({
      success: true,
      following,
      count: following.length,
    });
  } catch (error) {
    console.error("GET FOLLOWING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch following",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 7. USER PROFILE CONTENT TABS (Watchlist, Reviews, Ratings, Activity, Likes)
|--------------------------------------------------------------------------
*/
exports.GetUserWatchlistForProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { mediaType = "all", status = "all" } = req.query;

    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;
    const isSelf = viewerId && viewerId.toString() === targetUser._id.toString();

    if (!isSelf && targetUser.privacy?.showWatchlist === false) {
      return res.status(403).json({
        success: false,
        message: "This user's watchlist is private",
        results: [],
      });
    }

    const filter = { user: targetUser._id };
    if (mediaType && mediaType !== "all") filter.mediaType = mediaType;
    if (status && status !== "all") filter.status = status;

    const items = await WatchHub_Watchlist.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: items,
      total: items.length,
    });
  } catch (error) {
    console.error("GET USER WATCHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user watchlist",
    });
  }
};

exports.GetUserReviewsForProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;
    const isSelf = viewerId && viewerId.toString() === targetUser._id.toString();

    if (!isSelf && targetUser.privacy?.showReviews === false) {
      return res.status(403).json({
        success: false,
        message: "This user's reviews are private",
        results: [],
      });
    }

    const reviews = await MediaReview.find({ User: targetUser._id })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich reviews with watchlist poster if user added this media to watchlist
    const enrichedReviews = await Promise.all(
      reviews.map(async (rev) => {
        const watchItem = await WatchHub_Watchlist.findOne({
          user: targetUser._id,
          tmdbId: Number(rev.MediaID),
        }).select("title posterPath releaseDate").lean();

        return {
          ...rev,
          mediaTitle: watchItem?.title || `${rev.MediaType.toUpperCase()} #${rev.MediaID}`,
          posterPath: watchItem?.posterPath || null,
          likesCount: rev.likes?.length || 0,
          repliesCount: rev.replies?.length || 0,
          hasLiked: viewerId ? rev.likes?.some((id) => id.toString() === viewerId.toString()) : false,
        };
      })
    );

    return res.status(200).json({
      success: true,
      results: enrichedReviews,
      total: enrichedReviews.length,
    });
  } catch (error) {
    console.error("GET USER REVIEWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user reviews",
    });
  }
};

exports.GetUserRatingsForProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;
    const isSelf = viewerId && viewerId.toString() === targetUser._id.toString();

    if (!isSelf && targetUser.privacy?.showRatings === false) {
      return res.status(403).json({
        success: false,
        message: "This user's ratings are private",
        results: [],
      });
    }

    const ratedItems = await WatchHub_Watchlist.find({
      user: targetUser._id,
      personalRating: { $ne: null, $gt: 0 },
    })
      .sort({ personalRating: -1, updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      results: ratedItems,
      total: ratedItems.length,
    });
  } catch (error) {
    console.error("GET USER RATINGS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user ratings",
    });
  }
};

exports.GetUserActivityForProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;
    const isSelf = viewerId && viewerId.toString() === targetUser._id.toString();

    if (!isSelf && targetUser.privacy?.showWatchActivity === false) {
      return res.status(403).json({
        success: false,
        message: "This user's activity is private",
        results: [],
      });
    }

    const [watchlistItems, reviews, collections] = await Promise.all([
      WatchHub_Watchlist.find({ user: targetUser._id }).sort({ updatedAt: -1 }).limit(20).lean(),
      MediaReview.find({ User: targetUser._id }).sort({ createdAt: -1 }).limit(10).lean(),
      WatchHub_Collection.find({ owner: targetUser._id, ...(isSelf ? {} : { visibility: "public" }) })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const activity = [];

    watchlistItems.forEach((w) => {
      activity.push({
        id: `w-${w._id}`,
        type: w.status === "completed" ? "completed" : w.status === "watching" ? "watching" : "added",
        title: w.title,
        mediaType: w.mediaType,
        tmdbId: w.tmdbId,
        posterPath: w.posterPath,
        date: w.watchedAt || w.updatedAt || w.createdAt,
        details: w.personalRating ? `Rated ${w.personalRating}/10 • ${w.status.replace(/_/g, " ")}` : `Status: ${w.status.replace(/_/g, " ")}`,
      });
    });

    reviews.forEach((r) => {
      activity.push({
        id: `r-${r._id}`,
        type: "review",
        title: `Wrote a review for ${r.MediaType.toUpperCase()}`,
        mediaType: r.MediaType,
        tmdbId: r.MediaID,
        date: r.createdAt,
        details: `Rating: ${r.rating} — "${r.comment.slice(0, 100)}"`,
      });
    });

    collections.forEach((c) => {
      activity.push({
        id: `c-${c._id}`,
        type: "collection",
        title: `Created collection: ${c.name}`,
        details: `${c.stats?.totalItems || c.items?.length || 0} titles • ${c.visibility}`,
        date: c.createdAt,
        slug: c.slug,
      });
    });

    activity.sort((a, b) => new Date(b.date) - new Date(a.date));

    return res.status(200).json({
      success: true,
      results: activity,
      total: activity.length,
    });
  } catch (error) {
    console.error("GET USER ACTIVITY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user activity",
    });
  }
};

exports.GetUserLikesForProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    const targetUser = await findUserByIdentifier(identifier);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const viewerId = req.user ? req.user._id : null;
    const isSelf = viewerId && viewerId.toString() === targetUser._id.toString();

    if (!isSelf && targetUser.privacy?.showLikes === false) {
      return res.status(403).json({
        success: false,
        message: "This user's likes are private",
        results: { reviews: [], collections: [] },
      });
    }

    const [likedReviews, likedCollections] = await Promise.all([
      MediaReview.find({ likes: targetUser._id }).populate("User", "User_Name displayName avatar").limit(20).lean(),
      WatchHub_Collection.find({
        "engagement.likes": { $gt: 0 },
        ...(isSelf ? {} : { visibility: "public" }),
      }).limit(10).lean(),
    ]);

    return res.status(200).json({
      success: true,
      results: {
        reviews: likedReviews,
        collections: likedCollections,
      },
    });
  } catch (error) {
    console.error("GET USER LIKES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user likes",
    });
  }
};
