const Watchlist = require("../models/WatchHub_Watchlist_model");

/*
|--------------------------------------------------------------------------
| 1. GET USER WATCHLIST (with filters, search, sorting & pagination)
|--------------------------------------------------------------------------
*/
exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      type = "all",
      status = "all",
      search = "",
      sort = "recent",
      page = 1,
      limit = 24,
    } = req.query;

    const filter = { user: userId };

    if (type && type !== "all") {
      filter.mediaType = type;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim() !== "") {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    // Sort mappings
    let sortQuery = { addedAt: -1 };
    if (sort === "oldest") {
      sortQuery = { addedAt: 1 };
    } else if (sort === "title_asc" || sort === "title") {
      sortQuery = { title: 1 };
    } else if (sort === "title_desc") {
      sortQuery = { title: -1 };
    } else if (sort === "release_date") {
      sortQuery = { releaseDate: -1 };
    } else if (sort === "rating_high" || sort === "rating") {
      sortQuery = { personalRating: -1, addedAt: -1 };
    } else if (sort === "rating_low") {
      sortQuery = { personalRating: 1, addedAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, totalFiltered, allUserItems] = await Promise.all([
      Watchlist.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Watchlist.countDocuments(filter),
      Watchlist.find({ user: userId }).select("status mediaType personalRating").lean(),
    ]);

    // Aggregate overall status counters for user's entire watchlist
    const statusCounts = {
      all: allUserItems.length,
      want_to_watch: 0,
      watching: 0,
      completed: 0,
      on_hold: 0,
      dropped: 0,
    };

    const typeCounts = {
      all: allUserItems.length,
      movie: 0,
      tv: 0,
      anime: 0,
    };

    allUserItems.forEach((item) => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
      if (typeCounts[item.mediaType] !== undefined) {
        typeCounts[item.mediaType]++;
      }
    });

    res.json({
      success: true,
      results: items,
      total: totalFiltered,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalFiltered / Number(limit)) || 1,
      statusCounts,
      typeCounts,
    });
  } catch (error) {
    console.error("Get Watchlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 2. GET SINGLE WATCHLIST ITEM STATUS
|--------------------------------------------------------------------------
*/
exports.getWatchlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mediaType, mediaId } = req.params;

    const item = await Watchlist.findOne({
      user: userId,
      tmdbId: Number(mediaId),
      mediaType,
    }).lean();

    res.json({
      success: true,
      inWatchlist: Boolean(item),
      item: item || null,
    });
  } catch (error) {
    console.error("Get Watchlist Item Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist item",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 3. ADD TO WATCHLIST (or Upsert)
|--------------------------------------------------------------------------
*/
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      tmdbId,
      mediaType,
      title,
      posterPath,
      backdropPath,
      releaseDate,
      status = "want_to_watch",
      personalRating = null,
      notes = "",
    } = req.body;

    if (!tmdbId || !mediaType || !title) {
      return res.status(400).json({
        success: false,
        message: "tmdbId, mediaType, and title are required",
      });
    }

    const watchedAt = status === "completed" ? new Date() : null;

    const item = await Watchlist.findOneAndUpdate(
      {
        user: userId,
        tmdbId: Number(tmdbId),
        mediaType,
      },
      {
        $set: {
          title: title.trim(),
          posterPath: posterPath || null,
          backdropPath: backdropPath || null,
          releaseDate: releaseDate || null,
          status,
          personalRating: personalRating ? Number(personalRating) : null,
          notes: notes ? notes.trim() : "",
          ...(watchedAt ? { watchedAt } : {}),
        },
        $setOnInsert: {
          user: userId,
          addedAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(201).json({
      success: true,
      message: "Added to watchlist successfully",
      item,
    });
  } catch (error) {
    console.error("Add Watchlist Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add to watchlist",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 4. UPDATE WATCHLIST STATUS
|--------------------------------------------------------------------------
*/
exports.updateWatchlistStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mediaType, mediaId } = req.params;
    const { status } = req.body;

    const validStatuses = ["want_to_watch", "watching", "completed", "on_hold", "dropped"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updateFields = { status };
    if (status === "completed") {
      updateFields.watchedAt = new Date();
    }

    const item = await Watchlist.findOneAndUpdate(
      {
        user: userId,
        tmdbId: Number(mediaId),
        mediaType,
      },
      { $set: updateFields },
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in watchlist",
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status.replace(/_/g, " ")}`,
      item,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 5. UPDATE PERSONAL RATING & NOTES
|--------------------------------------------------------------------------
*/
exports.updateWatchlistRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mediaType, mediaId } = req.params;
    const { rating, notes } = req.body;

    const updateFields = {};
    if (rating !== undefined) {
      updateFields.personalRating = rating !== null ? Number(rating) : null;
    }
    if (notes !== undefined) {
      updateFields.notes = String(notes).trim();
    }

    const item = await Watchlist.findOneAndUpdate(
      {
        user: userId,
        tmdbId: Number(mediaId),
        mediaType,
      },
      { $set: updateFields },
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in watchlist",
      });
    }

    res.json({
      success: true,
      message: "Rating and notes updated",
      item,
    });
  } catch (error) {
    console.error("Update Rating Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update rating",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 6. UPDATE FULL WATCHLIST ITEM
|--------------------------------------------------------------------------
*/
exports.updateWatchlistItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mediaType, mediaId } = req.params;
    const { status, personalRating, notes, watchedAt, progress } = req.body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (personalRating !== undefined) updateFields.personalRating = personalRating;
    if (notes !== undefined) updateFields.notes = String(notes).trim();
    if (watchedAt !== undefined) updateFields.watchedAt = watchedAt;
    if (progress !== undefined) updateFields.progress = progress;

    const item = await Watchlist.findOneAndUpdate(
      {
        user: userId,
        tmdbId: Number(mediaId),
        mediaType,
      },
      { $set: updateFields },
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in watchlist",
      });
    }

    res.json({
      success: true,
      message: "Watchlist item updated",
      item,
    });
  } catch (error) {
    console.error("Update Watchlist Item Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update item",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 7. REMOVE FROM WATCHLIST
|--------------------------------------------------------------------------
*/
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mediaType, mediaId } = req.params;

    const item = await Watchlist.findOneAndDelete({
      user: userId,
      tmdbId: Number(mediaId),
      mediaType,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in watchlist",
      });
    }

    res.json({
      success: true,
      message: "Removed from watchlist",
      deletedId: item._id,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
    });
  } catch (error) {
    console.error("Remove Watchlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from watchlist",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 8. GET WATCH HISTORY (Grouped by Today, Yesterday, Older)
|--------------------------------------------------------------------------
*/
exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const watchedItems = await Watchlist.find({
      user: userId,
      $or: [{ watchedAt: { $ne: null } }, { status: "completed" }],
    })
      .sort({ watchedAt: -1, updatedAt: -1 })
      .lean();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const history = {
      today: [],
      yesterday: [],
      older: [],
      total: watchedItems.length,
    };

    watchedItems.forEach((item) => {
      const watchedDate = new Date(item.watchedAt || item.updatedAt);
      if (watchedDate >= todayStart) {
        history.today.push(item);
      } else if (watchedDate >= yesterdayStart) {
        history.yesterday.push(item);
      } else {
        history.older.push(item);
      }
    });

    res.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Get Watch History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watch history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 9. REMOVE / MARK AS UNWATCHED
|--------------------------------------------------------------------------
*/
exports.removeFromHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mediaType, mediaId } = req.params;

    const item = await Watchlist.findOneAndUpdate(
      {
        user: userId,
        tmdbId: Number(mediaId),
        mediaType,
      },
      {
        $set: {
          watchedAt: null,
          status: "want_to_watch",
        },
      },
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in history",
      });
    }

    res.json({
      success: true,
      message: "Marked as unwatched",
      item,
    });
  } catch (error) {
    console.error("Remove From History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 10. CLEAR WATCH HISTORY
|--------------------------------------------------------------------------
*/
exports.clearWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    await Watchlist.updateMany(
      { user: userId, $or: [{ watchedAt: { $ne: null } }, { status: "completed" }] },
      { $set: { watchedAt: null, status: "want_to_watch" } },
    );

    res.json({
      success: true,
      message: "Watch history cleared successfully",
    });
  } catch (error) {
    console.error("Clear Watch History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear watch history",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 11. GET UPCOMING WATCHLIST TITLES
|--------------------------------------------------------------------------
*/
exports.getUpcomingWatchlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const todayStr = new Date().toISOString().split("T")[0];

    const upcomingItems = await Watchlist.find({
      user: userId,
      releaseDate: { $gte: todayStr },
      status: { $ne: "completed" },
    })
      .sort({ releaseDate: 1 })
      .lean();

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const enriched = upcomingItems.map((item) => {
      let daysRemaining = null;
      let statusText = "Release date TBA";

      if (item.releaseDate) {
        const releaseD = new Date(item.releaseDate);
        if (!isNaN(releaseD.getTime())) {
          const diffDays = Math.ceil((releaseD - todayDate) / (1000 * 60 * 60 * 24));
          daysRemaining = diffDays;
          if (diffDays === 0) statusText = "Releases Today";
          else if (diffDays === 1) statusText = "Releasing Tomorrow";
          else if (diffDays > 0) statusText = `${diffDays} days left`;
          else statusText = "Released";
        }
      }

      return {
        ...item,
        daysRemaining,
        releaseStatus: statusText,
      };
    });

    res.json({
      success: true,
      results: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error("Get Upcoming Watchlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming watchlist",
    });
  }
};

/*
|--------------------------------------------------------------------------
| 12. GET WATCHLIST STATS & BREAKDOWN
|--------------------------------------------------------------------------
*/
exports.getWatchlistStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await Watchlist.find({ user: userId }).lean();

    const stats = {
      total: items.length,
      want_to_watch: 0,
      watching: 0,
      completed: 0,
      on_hold: 0,
      dropped: 0,
      movieCount: 0,
      tvCount: 0,
      animeCount: 0,
      ratedCount: 0,
      averageRating: 0,
    };

    let totalRatingSum = 0;

    items.forEach((item) => {
      if (stats[item.status] !== undefined) stats[item.status]++;
      if (item.mediaType === "movie") stats.movieCount++;
      if (item.mediaType === "tv") stats.tvCount++;
      if (item.mediaType === "anime") stats.animeCount++;

      if (item.personalRating) {
        stats.ratedCount++;
        totalRatingSum += item.personalRating;
      }
    });

    if (stats.ratedCount > 0) {
      stats.averageRating = Number((totalRatingSum / stats.ratedCount).toFixed(1));
    }

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Watchlist Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist stats",
    });
  }
};
