const Franchise = require("../models/Franchise/Franchise");
const FranchiseFollow = require("../models/Franchise/Franchise_Following");
const { fetchFromTMDB } = require("../ultils/tmdbService");

exports.getFranchises = async (req, res) => {
  try {
    const { sort = "followers", sourceType } = req.query;

    let query = {};

    if (sourceType) {
      query.sourceType = sourceType;
    }

    let sortOption = {};

    switch (sort) {
      case "new":
        sortOption = { createdAt: -1 };
        break;

      case "old":
        sortOption = { createdAt: 1 };
        break;

      case "followers":
      default:
        sortOption = { followers: -1 };
        break;
    }

    const franchises = await Franchise.find(query).sort(sortOption);

    res.status(200).json(franchises);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch franchises",
    });
  }
};

exports.getFranchiseDetails = async (req, res) => {
  try {
    const franchise = await Franchise.findOne({
      slug: req.params.slug,
    });

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    res.status(200).json(franchise);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch franchise",
    });
  }
};

exports.getFranchiseContent = async (req, res) => {
  try {
    const franchise = await Franchise.findOne({
      slug: req.params.slug,
    });

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    let results = [];

    switch (franchise.sourceType) {
      case "collection": {
        const collection = await fetchFromTMDB(
          `/collection/${franchise.tmdbCollectionId}`,
        );

        results = collection.parts || [];

        break;
      }

      case "company": {
        const movies = await fetchFromTMDB("/discover/movie", {
          with_companies: franchise.tmdbCompanyId,
          sort_by: "popularity.desc",
        });

        const shows = await fetchFromTMDB("/discover/tv", {
          with_companies: franchise.tmdbCompanyId,
          sort_by: "popularity.desc",
        });

        results = [
          ...(movies.results || []).map((m) => ({
            ...m,
            media_type: "movie",
          })),
          ...(shows.results || []).map((s) => ({
            ...s,
            media_type: "tv",
          })),
        ];

        break;
      }

      case "keyword": {
        for (const keyword of franchise.keywords) {
          const movies = await fetchFromTMDB("/search/movie", {
            query: keyword,
          });

          const shows = await fetchFromTMDB("/search/tv", {
            query: keyword,
          });

          results.push(
            ...(movies.results || []).map((m) => ({
              ...m,
              media_type: "movie",
            })),
            ...(shows.results || []).map((s) => ({
              ...s,
              media_type: "tv",
            })),
          );
        }

        break;
      }

      default:
        return res.status(400).json({
          message: "Invalid franchise type",
        });
    }

    // Remove duplicates
    results = results.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.id === item.id && t.media_type === item.media_type,
        ),
    );

    res.status(200).json(results);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch franchise content",
    });
  }
};

exports.createFranchise = async (req, res) => {
  try {
    const franchise = await Franchise.create(req.body);

    res.status(201).json(franchise);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create franchise",
    });
  }
};

exports.updateFranchise = async (req, res) => {
  try {
    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    res.json(franchise);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update franchise",
    });
  }
};

exports.deleteFranchise = async (req, res) => {
  try {
    await Franchise.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Franchise deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete franchise",
    });
  }
};

exports.followFranchise = async (req, res) => {
  try {
    const franchiseId = req.params.id;

    const existing = await FranchiseFollow.findOne({
      user: req.user.id,
      franchise: franchiseId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    await FranchiseFollow.create({
      user: req.user.id,
      franchise: franchiseId,
    });

    await Franchise.findByIdAndUpdate(franchiseId, {
      $inc: {
        followers: 1,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to follow franchise",
    });
  }
};
exports.unfollowFranchise = async (req, res) => {
  try {
    const franchiseId = req.params.id;

    const follow = await FranchiseFollow.findOneAndDelete({
      user: req.user.id,
      franchise: franchiseId,
    });

    if (!follow) {
      return res.status(404).json({
        message: "Not following",
      });
    }

    await Franchise.findByIdAndUpdate(franchiseId, {
      $inc: {
        followers: -1,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to unfollow",
    });
  }
};
exports.myFranchises = async (req, res) => {
  try {
    const follows = await FranchiseFollow.find({
      user: req.user.id,
    }).populate("franchise");

    const franchises = follows.map((follow) => follow.franchise);

    res.json(franchises);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch franchises",
    });
  }
};
