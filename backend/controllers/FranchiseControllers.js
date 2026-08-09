const Franchise = require("../models/Franchise/Franchise");
const FranchiseFollow = require("../models/Franchise/Franchise_Following");
const { fetchFromTMDB } = require("../ultils/tmdbService");

/*
============================================================
DEFAULT FRANCHISES
============================================================
*/

const DEFAULT_FRANCHISES = [
  {
    name: "Marvel Cinematic Universe",
    slug: "marvel-cinematic-universe",
    description:
      "The epic superhero franchise encompassing Earth's mightiest heroes, cosmic defenders, and the multiverse.",

    logo: "https://image.tmdb.org/t/p/w500/8qBwBD2Yx3d30vJ7mlyJ3d57P9p.png",

    banner:
      "https://image.tmdb.org/t/p/original/muth4OYamXf41G2evdrLEg8d3om.jpg",

    sourceType: "company",

    // Marvel Studios
    tmdbCompanyId: 420,

    followers: 1250,
  },

  {
    name: "Star Wars Saga",
    slug: "star-wars-saga",
    description:
      "In a galaxy far, far away... The legendary saga of Jedi, Sith, galactic empires and rebels.",

    logo: "https://image.tmdb.org/t/p/w500/6804WSpTM8k41LioZgvtMVPp4v4.png",

    banner:
      "https://image.tmdb.org/t/p/original/5iwx1ScqU220uHw7tB62qmoqL4r.jpg",

    sourceType: "collection",

    tmdbCollectionId: 10,

    followers: 980,
  },

  {
    name: "Harry Potter Wizarding World",
    slug: "harry-potter",
    description:
      "Step into Hogwarts and experience the magic, spells, and battles against the Dark Arts.",

    banner:
      "https://image.tmdb.org/t/p/original/5NYvVP2YexOQ8UKwFzToL4z8IGa.jpg",

    sourceType: "collection",

    tmdbCollectionId: 1241,

    followers: 1120,
  },

  {
    name: "Studio Ghibli Classics",
    slug: "studio-ghibli",
    description:
      "Enchanting animated masterpieces produced by Japan's legendary Studio Ghibli.",

    banner:
      "https://image.tmdb.org/t/p/original/706awcxVJ6V4txw3Z9W6d328H8L.jpg",

    sourceType: "company",

    tmdbCompanyId: 10342,

    followers: 850,
  },

  {
    name: "The Lord of the Rings",
    slug: "lord-of-the-rings",
    description:
      "The timeless epic journey through Middle-earth to destroy the One Ring.",

    banner:
      "https://image.tmdb.org/t/p/original/vL5LR6WvyjPZ1JvYi2zLSpMEvjM.jpg",

    sourceType: "collection",

    tmdbCollectionId: 119,

    followers: 1430,
  },

  {
    name: "Batman Universe",
    slug: "batman-universe",
    description:
      "Gotham City's Dark Knight fighting crime, villains, and corruption across films and series.",

    banner:
      "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJm2n.jpg",

    sourceType: "keyword",

    keywords: ["Batman", "Dark Knight"],

    followers: 910,
  },
];

/*
============================================================
GET ALL FRANCHISES
============================================================

GET /api/franchises

Query parameters:

?sort=followers
?sort=new
?sort=old

?sourceType=collection
?sourceType=company
?sourceType=keyword
*/

exports.getFranchises = async (req, res) => {
  try {
    const { sort = "followers", sourceType } = req.query;

    const query = {};

    /*
    ----------------------------------------------------------
    FILTER BY SOURCE TYPE
    ----------------------------------------------------------
    */

    if (sourceType) {
      query.sourceType = sourceType;
    }

    /*
    ----------------------------------------------------------
    SORT
    ----------------------------------------------------------
    */

    let sortOption = {};

    switch (sort) {
      case "new":
        sortOption = {
          createdAt: -1,
        };
        break;

      case "old":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "followers":
      default:
        sortOption = {
          followers: -1,
        };
        break;
    }

    /*
    ----------------------------------------------------------
    FETCH
    ----------------------------------------------------------
    */

    let franchises = await Franchise.find(query).sort(sortOption);

    /*
    ----------------------------------------------------------
    AUTO SEED
    ----------------------------------------------------------

    If database is completely empty, insert default
    franchises automatically.
    */

    if (franchises.length === 0 && !sourceType) {
      const totalCount = await Franchise.countDocuments();

      if (totalCount === 0) {
        await Franchise.insertMany(DEFAULT_FRANCHISES);

        franchises = await Franchise.find(query).sort(sortOption);
      }
    }

    res.status(200).json(franchises);
  } catch (error) {
    console.error("Get franchises error:", error);

    res.status(500).json({
      message: "Failed to fetch franchises",
    });
  }
};

/*
============================================================
SEED DEFAULT FRANCHISES
============================================================

POST /api/franchises/seed

Development/admin utility.

This updates existing default franchises as well.
*/

exports.seedFranchises = async (req, res) => {
  try {
    for (const franchise of DEFAULT_FRANCHISES) {
      await Franchise.updateOne(
        {
          slug: franchise.slug,
        },
        {
          $set: franchise,
        },
        {
          upsert: true,
        },
      );
    }

    const franchises = await Franchise.find().sort({
      followers: -1,
    });

    res.status(200).json({
      success: true,
      message: "Default franchises seeded successfully",
      franchises,
    });
  } catch (error) {
    console.error("Seed franchises error:", error);

    res.status(500).json({
      message: "Failed to seed franchises",
    });
  }
};

/*
============================================================
GET FRANCHISE DETAILS
============================================================

GET /api/franchises/:slug
*/

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
    console.error("Get franchise details error:", error);

    res.status(500).json({
      message: "Failed to fetch franchise",
    });
  }
};

/*
============================================================
GET FRANCHISE CONTENT
============================================================

GET /api/franchises/:slug/content

This fetches movies/shows automatically from TMDB.

Supported:

1. collection
2. company
3. keyword
*/

exports.getFranchiseContent = async (req, res) => {
  try {
    const franchise = await Franchise.findOne({
      slug: req.params.slug,
    });

    /*
    ----------------------------------------------------------
    FRANCHISE NOT FOUND
    ----------------------------------------------------------
    */

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    let results = [];

    /*
    ==========================================================
    HELPER: FETCH ALL TMDB PAGES
    ==========================================================
    */

    const fetchAllPages = async (endpoint, params = {}, maxPages = 20) => {
      const allResults = [];

      /*
      --------------------------------------------------------
      FIRST PAGE
      --------------------------------------------------------
      */

      const firstPage = await fetchFromTMDB(endpoint, {
        ...params,
        page: 1,
      });

      allResults.push(...(firstPage.results || []));

      /*
      --------------------------------------------------------
      TOTAL PAGES
      --------------------------------------------------------
      */

      const totalPages = Math.min(firstPage.total_pages || 1, maxPages);

      /*
      --------------------------------------------------------
      REMAINING PAGES
      --------------------------------------------------------
      */

      for (let page = 2; page <= totalPages; page++) {
        const response = await fetchFromTMDB(endpoint, {
          ...params,
          page,
        });

        allResults.push(...(response.results || []));
      }

      return allResults;
    };

    /*
    ==========================================================
    SOURCE TYPE: COLLECTION
    ==========================================================
    */

    if (franchise.sourceType === "collection" && franchise.tmdbCollectionId) {
      const collection = await fetchFromTMDB(
        `/collection/${franchise.tmdbCollectionId}`,
      );

      results = (collection.parts || []).map((movie) => ({
        ...movie,
        media_type: "movie",
      }));
    } else if (franchise.sourceType === "company" && franchise.tmdbCompanyId) {

    /*
    ==========================================================
    SOURCE TYPE: COMPANY
    ==========================================================
    */
      /*
      --------------------------------------------------------
      MOVIES
      --------------------------------------------------------
      */

      const movies = await fetchAllPages("/discover/movie", {
        with_companies: franchise.tmdbCompanyId,

        sort_by: "primary_release_date.desc",

        include_adult: false,
      });

      results.push(
        ...movies.map((movie) => ({
          ...movie,
          media_type: "movie",
        })),
      );

      /*
      --------------------------------------------------------
      TV SHOWS
      --------------------------------------------------------
      */

      const shows = await fetchAllPages("/discover/tv", {
        with_companies: franchise.tmdbCompanyId,

        sort_by: "first_air_date.desc",

        include_adult: false,
      });

      results.push(
        ...shows.map((show) => ({
          ...show,
          media_type: "tv",
        })),
      );
    } else if (

    /*
    ==========================================================
    SOURCE TYPE: KEYWORD
    ==========================================================
    */
      franchise.sourceType === "keyword" &&
      Array.isArray(franchise.keywords) &&
      franchise.keywords.length > 0
    ) {
      /*
      --------------------------------------------------------
      EACH KEYWORD
      --------------------------------------------------------
      */

      for (const keyword of franchise.keywords) {
        /*
        ------------------------------------------------------
        MOVIES
        ------------------------------------------------------
        */

        const movies = await fetchAllPages("/search/movie", {
          query: keyword,
          include_adult: false,
        });

        results.push(
          ...movies.map((movie) => ({
            ...movie,
            media_type: "movie",
          })),
        );

        /*
        ------------------------------------------------------
        TV SHOWS
        ------------------------------------------------------
        */

        const shows = await fetchAllPages("/search/tv", {
          query: keyword,
          include_adult: false,
        });

        results.push(
          ...shows.map((show) => ({
            ...show,
            media_type: "tv",
          })),
        );
      }
    } else {

    /*
    ==========================================================
    INVALID CONFIGURATION
    ==========================================================
    */
      return res.status(400).json({
        message: "Invalid franchise configuration",
      });
    }

    /*
    ==========================================================
    REMOVE DUPLICATES
    ==========================================================

    Same TMDB ID can appear multiple times,
    especially for keyword-based franchises.
    */

    results = Array.from(
      new Map(
        results.map((item) => [`${item.media_type}-${item.id}`, item]),
      ).values(),
    );

    /*
    ==========================================================
    SORT BY RELEASE DATE
    ==========================================================

    Newest first.
    */

    results.sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "0000-00-00";

      const dateB = b.release_date || b.first_air_date || "0000-00-00";

      return dateB.localeCompare(dateA);
    });

    /*
    ==========================================================
    SEPARATE MOVIES AND TV
    ==========================================================
    */

    const movies = results.filter((item) => item.media_type === "movie");

    const tvShows = results.filter((item) => item.media_type === "tv");

    /*
    ==========================================================
    RESPONSE
    ==========================================================
    */

    res.status(200).json({
      franchise: {
        id: franchise._id,
        name: franchise.name,
        slug: franchise.slug,
        sourceType: franchise.sourceType,
      },

      total: results.length,

      movies: movies.length,

      tvShows: tvShows.length,

      results,
    });
  } catch (error) {
    console.error("Franchise content error:", error);

    res.status(500).json({
      message: "Failed to fetch franchise content",
    });
  }
};

/*
============================================================
CREATE FRANCHISE
============================================================

POST /api/franchises

ADMIN ONLY
*/

exports.createFranchise = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      logo,
      banner,
      sourceType,
      tmdbCollectionId,
      tmdbCompanyId,
      keywords,
    } = req.body;

    /*
    ----------------------------------------------------------
    BASIC VALIDATION
    ----------------------------------------------------------
    */

    if (!name || !slug || !sourceType) {
      return res.status(400).json({
        message: "Name, slug and sourceType are required",
      });
    }

    /*
    ----------------------------------------------------------
    SOURCE VALIDATION
    ----------------------------------------------------------
    */

    if (sourceType === "collection" && !tmdbCollectionId) {
      return res.status(400).json({
        message: "tmdbCollectionId is required for collection franchises",
      });
    }

    if (sourceType === "company" && !tmdbCompanyId) {
      return res.status(400).json({
        message: "tmdbCompanyId is required for company franchises",
      });
    }

    if (
      sourceType === "keyword" &&
      (!Array.isArray(keywords) || keywords.length === 0)
    ) {
      return res.status(400).json({
        message: "At least one keyword is required for keyword franchises",
      });
    }

    /*
    ----------------------------------------------------------
    CHECK DUPLICATE SLUG
    ----------------------------------------------------------
    */

    const existing = await Franchise.findOne({
      slug,
    });

    if (existing) {
      return res.status(409).json({
        message: "A franchise with this slug already exists",
      });
    }

    /*
    ----------------------------------------------------------
    CREATE
    ----------------------------------------------------------
    */

    const franchise = await Franchise.create({
      name,
      slug,
      description,
      logo,
      banner,
      sourceType,
      tmdbCollectionId:
        sourceType === "collection" ? tmdbCollectionId : undefined,

      tmdbCompanyId: sourceType === "company" ? tmdbCompanyId : undefined,

      keywords: sourceType === "keyword" ? keywords : [],

      followers: 0,
    });

    res.status(201).json(franchise);
  } catch (error) {
    console.error("Create franchise error:", error);

    /*
    ----------------------------------------------------------
    MONGOOSE VALIDATION ERROR
    ----------------------------------------------------------
    */

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    /*
    ----------------------------------------------------------
    DUPLICATE KEY
    ----------------------------------------------------------
    */

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Franchise already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create franchise",
    });
  }
};

/*
============================================================
UPDATE FRANCHISE
============================================================

PUT /api/franchises/:id

ADMIN ONLY
*/

exports.updateFranchise = async (req, res) => {
  try {
    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    res.status(200).json(franchise);
  } catch (error) {
    console.error("Update franchise error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update franchise",
    });
  }
};

/*
============================================================
DELETE FRANCHISE
============================================================

DELETE /api/franchises/:id

ADMIN ONLY
*/

exports.deleteFranchise = async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.id);

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    /*
    ----------------------------------------------------------
    DELETE ALL FOLLOW RECORDS
    ----------------------------------------------------------
    */

    await FranchiseFollow.deleteMany({
      franchise: franchise._id,
    });

    /*
    ----------------------------------------------------------
    DELETE FRANCHISE
    ----------------------------------------------------------
    */

    await Franchise.findByIdAndDelete(franchise._id);

    res.status(200).json({
      success: true,
      message: "Franchise deleted successfully",
    });
  } catch (error) {
    console.error("Delete franchise error:", error);

    res.status(500).json({
      message: "Failed to delete franchise",
    });
  }
};

/*
============================================================
FOLLOW FRANCHISE
============================================================

POST /api/franchises/follow/:id

AUTHENTICATED USER
*/

exports.followFranchise = async (req, res) => {
  try {
    const franchiseId = req.params.id;

    /*
    ----------------------------------------------------------
    CHECK FRANCHISE
    ----------------------------------------------------------
    */

    const franchise = await Franchise.findById(franchiseId);

    if (!franchise) {
      return res.status(404).json({
        message: "Franchise not found",
      });
    }

    /*
    ----------------------------------------------------------
    CHECK EXISTING FOLLOW
    ----------------------------------------------------------
    */

    const existing = await FranchiseFollow.findOne({
      user: req.user.id,
      franchise: franchiseId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Already following",
      });
    }

    /*
    ----------------------------------------------------------
    CREATE FOLLOW
    ----------------------------------------------------------
    */

    await FranchiseFollow.create({
      user: req.user.id,
      franchise: franchiseId,
    });

    /*
    ----------------------------------------------------------
    INCREMENT FOLLOWERS
    ----------------------------------------------------------
    */

    await Franchise.findByIdAndUpdate(franchiseId, {
      $inc: {
        followers: 1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Franchise followed successfully",
    });
  } catch (error) {
    console.error("Follow franchise error:", error);

    res.status(500).json({
      message: "Failed to follow franchise",
    });
  }
};

/*
============================================================
UNFOLLOW FRANCHISE
============================================================

DELETE /api/franchises/follow/:id

AUTHENTICATED USER
*/

exports.unfollowFranchise = async (req, res) => {
  try {
    const franchiseId = req.params.id;

    /*
    ----------------------------------------------------------
    REMOVE FOLLOW
    ----------------------------------------------------------
    */

    const follow = await FranchiseFollow.findOneAndDelete({
      user: req.user.id,
      franchise: franchiseId,
    });

    if (!follow) {
      return res.status(404).json({
        message: "Not following this franchise",
      });
    }

    /*
    ----------------------------------------------------------
    DECREMENT FOLLOWERS
    ----------------------------------------------------------
    */

    await Franchise.findByIdAndUpdate(franchiseId, {
      $inc: {
        followers: -1,
      },
    });

    /*
    ----------------------------------------------------------
    PREVENT NEGATIVE FOLLOWERS
    ----------------------------------------------------------
    */

    await Franchise.updateOne(
      {
        _id: franchiseId,
        followers: {
          $lt: 0,
        },
      },
      {
        $set: {
          followers: 0,
        },
      },
    );

    res.status(200).json({
      success: true,
      message: "Franchise unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow franchise error:", error);

    res.status(500).json({
      message: "Failed to unfollow franchise",
    });
  }
};

/*
============================================================
MY FOLLOWING FRANCHISES
============================================================

GET /api/franchises/my/following

AUTHENTICATED USER
*/

exports.myFranchises = async (req, res) => {
  try {
    const follows = await FranchiseFollow.find({
      user: req.user.id,
    })
      .populate("franchise")
      .sort({
        createdAt: -1,
      });

    const franchises = follows
      .map((follow) => follow.franchise)
      .filter(Boolean);

    res.status(200).json(franchises);
  } catch (error) {
    console.error("My franchises error:", error);

    res.status(500).json({
      message: "Failed to fetch franchises",
    });
  }
};
