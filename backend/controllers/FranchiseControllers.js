const Franchise = require("../models/Franchise/Franchise");
const FranchiseFollow = require("../models/Franchise/Franchise_Following");
const { fetchFromTMDB } = require("../ultils/tmdbService");

/*
============================================================
DEFAULT FRANCHISES
============================================================

NOTE: `banner` values below are only used as a last-resort
fallback if a live TMDB lookup fails (see resolveBannerAndLogo
below). They are intentionally allowed to be stale/wrong —
the seeding functions always try to replace them with a real,
verified image straight from TMDB first.
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
    tmdbCompanyId: 420,
    keywords: [
      "Avengers",
      "Iron Man",
      "Spider-Man",
      "Captain America",
      "Thor",
      "Guardians of the Galaxy",
      "Doctor Strange",
      "Black Panther",
      "Ant-Man",
      "Deadpool",
      "Loki",
      "WandaVision",
    ],
    followers: 0,
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
    keywords: [
      "Star Wars",
      "Mandalorian",
      "Ahsoka",
      "Andor",
      "Obi-Wan",
      "Bad Batch",
      "Rogue One",
      "Solo",
    ],
    followers: 0,
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
    keywords: ["Harry Potter", "Fantastic Beasts"],
    followers: 0,
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
    keywords: [
      "Studio Ghibli",
      "Hayao Miyazaki",
      "Spirited Away",
      "Totoro",
      "Howl's Moving Castle",
    ],
    followers: 0,
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
    keywords: ["Lord of the Rings", "The Hobbit", "Rings of Power"],
    followers: 0,
  },
  {
    name: "Batman Universe",
    slug: "batman-universe",
    description:
      "Gotham City's Dark Knight fighting crime, villains, and corruption across films and series.",
    banner:
      "https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJm2n.jpg",
    sourceType: "keyword",
    keywords: [
      "Batman",
      "Dark Knight",
      "The Batman",
      "Penguin",
      "Joker",
      "Gotham",
    ],
    followers: 0,
  },
  {
    name: "DC Extended Universe",
    slug: "dc-multiverse",
    description:
      "Earth's greatest heroes: Superman, Batman, Wonder Woman, Aquaman, and the Justice League.",
    banner:
      "https://image.tmdb.org/t/p/original/t9XkeE7vFJm12TknT1g6pPh36mE.jpg",
    sourceType: "keyword",
    keywords: [
      "Justice League",
      "Superman",
      "Wonder Woman",
      "Aquaman",
      "The Flash",
      "Suicide Squad",
      "Shazam",
    ],
    followers: 0,
  },
  {
    name: "Spider-Man Universe",
    slug: "spiderman-universe",
    description:
      "Your friendly neighborhood Spider-Man across live-action sagas, Spider-Verse, and Venom.",
    banner:
      "https://image.tmdb.org/t/p/original/8Y43POKjjKDGI9z89v0efz1uWz8.jpg",
    sourceType: "keyword",
    keywords: ["Spider-Man", "Spider-Verse", "Venom"],
    followers: 0,
  },
  {
    name: "Fast & Furious Saga",
    slug: "fast-and-furious",
    description:
      "High-octane action, family, and global heists with Dom Toretto and his crew.",
    banner:
      "https://image.tmdb.org/t/p/original/yF1FAMmL2DB9DEyStfVJzotTYEO.jpg",
    sourceType: "collection",
    tmdbCollectionId: 9485,
    keywords: ["Fast & Furious", "Fast and Furious", "Hobbs & Shaw"],
    followers: 0,
  },
  {
    name: "James Bond 007",
    slug: "james-bond",
    description:
      "The iconic British secret agent 007 on dangerous covert missions across the globe.",
    banner:
      "https://image.tmdb.org/t/p/original/3i81E83aElnc7zS6aD2N5qKqP7w.jpg",
    sourceType: "keyword",
    keywords: [
      "James Bond",
      "007",
      "Casino Royale",
      "Skyfall",
      "No Time to Die",
    ],
    followers: 0,
  },
  {
    name: "Jurassic Park & World",
    slug: "jurassic-park",
    description:
      "Dinosaurs walk the Earth once more in John Hammond's revolutionary theme park vision.",
    banner:
      "https://image.tmdb.org/t/p/original/9i3plLl8L1G2Z8t3aV7B9gV5u3A.jpg",
    sourceType: "collection",
    tmdbCollectionId: 328,
    keywords: ["Jurassic Park", "Jurassic World"],
    followers: 0,
  },
  {
    name: "MonsterVerse",
    slug: "monsterverse",
    description:
      "Colossal Titans clash as Godzilla and King Kong battle for supreme dominance.",
    banner:
      "https://image.tmdb.org/t/p/original/7kW8XwL4aK7c6D9i4uW9t7g2t2W.jpg",
    sourceType: "keyword",
    keywords: ["Godzilla", "King Kong", "MonsterVerse"],
    followers: 0,
  },
  {
    name: "Transformers",
    slug: "transformers",
    description:
      "Autobots and Decepticons bring their ancient war for Cybertron to planet Earth.",
    banner:
      "https://image.tmdb.org/t/p/original/7BsvSuW2niX4862m7gT8aL0lB8G.jpg",
    sourceType: "collection",
    tmdbCollectionId: 8650,
    keywords: ["Transformers", "Bumblebee"],
    followers: 0,
  },
  {
    name: "Pirates of the Caribbean",
    slug: "pirates-of-the-caribbean",
    description:
      "Captain Jack Sparrow sets sail on supernatural adventures across the seven seas.",
    banner:
      "https://image.tmdb.org/t/p/original/z8onk7LVZ8O3v7dGv8N2c2t3u7G.jpg",
    sourceType: "collection",
    tmdbCollectionId: 295,
    keywords: ["Pirates of the Caribbean"],
    followers: 0,
  },
  {
    name: "Avatar Saga",
    slug: "avatar-saga",
    description:
      "Journey to the breathtaking world of Pandora with Jake Sully and the Na'vi.",
    banner:
      "https://image.tmdb.org/t/p/original/vL5LR6WvyjPZ1JvYi2zLSpMEvjM.jpg",
    sourceType: "collection",
    tmdbCollectionId: 87096,
    keywords: ["Avatar"],
    followers: 0,
  },
  {
    name: "Pixar Animation Studio",
    slug: "pixar-animation",
    description:
      "Heartwarming, revolutionary computer animated stories created by Pixar Animation Studios.",
    banner:
      "https://image.tmdb.org/t/p/original/lxD5h2p69wE0fR3uW1V6nZ6vW1P.jpg",
    sourceType: "company",
    tmdbCompanyId: 3,
    keywords: [
      "Toy Story",
      "Inside Out",
      "Incredibles",
      "Cars",
      "Finding Nemo",
    ],
    followers: 0,
  },
];

/*
============================================================
RESOLVE REAL BANNER/LOGO FROM TMDB
============================================================

Static image hashes typed by hand (or generated) drift out of
date or were simply never real TMDB assets, which is why some
franchise cards were falling back to the placeholder icon.

Instead of guessing paths, this pulls a real, currently-valid
image straight from TMDB using the IDs/keywords the franchise
already has:

  - collection  -> GET /collection/:id            -> backdrop_path
  - company     -> GET /discover/movie?with_companies=:id (most
                   popular title with a backdrop, since TMDB's
                   company endpoint itself has no backdrop_path)
  - keyword     -> GET /search/movie?query=<first keyword>

If the lookup fails for any reason (network issue, bad ID, TMDB
down) it quietly falls back to whatever banner/logo the caller
already had, so seeding never hard-fails because of one bad entry.
============================================================
*/

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/original";

/*
Gathers every movie TMDB associates with this franchise, using the
exact same source-specific calls getFranchiseContent already relies
on. This gives a real pool of actual movies to choose a banner from,
instead of trusting a single collection/company-level image field
(which is often missing or empty on TMDB even when the collection
or company itself is valid).
*/
const gatherCandidateMovies = async (data) => {
  if (data.sourceType === "collection" && data.tmdbCollectionId) {
    const collection = await fetchFromTMDB(
      `/collection/${data.tmdbCollectionId}`,
    );
    return collection?.parts || [];
  }

  if (data.sourceType === "company" && data.tmdbCompanyId) {
    const discover = await fetchFromTMDB("/discover/movie", {
      with_companies: data.tmdbCompanyId,
      sort_by: "popularity.desc",
      include_adult: false,
    });
    return discover?.results || [];
  }

  if (
    data.sourceType === "keyword" &&
    Array.isArray(data.keywords) &&
    data.keywords.length > 0
  ) {
    // Search across every keyword (not just the first) so there's a
    // real pool of movies to pick the "best" one from.
    const searches = await Promise.all(
      data.keywords.map((kw) =>
        fetchFromTMDB("/search/movie", {
          query: kw,
          include_adult: false,
        }).catch(() => ({ results: [] })),
      ),
    );
    return searches.flatMap((s) => s?.results || []);
  }

  return [];
};

/*
"Best" = most popular movie in the franchise that actually has a
backdrop image. Popularity is TMDB's own ranking signal, so this
naturally lands on the most iconic/well-known entry (e.g. Endgame
for MCU) rather than an obscure title with a missing image.
*/
const pickBestMovie = (movies) => {
  const withBackdrop = movies.filter((m) => m && m.backdrop_path);
  if (withBackdrop.length === 0) return null;
  return withBackdrop.sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0),
  )[0];
};

const resolveBannerAndLogo = async (data) => {
  const fallback = { banner: data.banner || "", logo: data.logo || "" };
  const tag = `[banner:${data.slug}]`;

  try {
    const candidates = await gatherCandidateMovies(data);
    const best = pickBestMovie(candidates);

    if (!best) {
      console.log(
        `${tag} checked ${candidates.length} candidate movie(s), none had a backdrop_path -> keeping fallback banner`,
      );
      return fallback;
    }

    const banner = `${TMDB_IMAGE_BASE}${best.backdrop_path}`;
    console.log(
      `${tag} picked best movie "${best.title}" (popularity ${best.popularity}) out of ${candidates.length} candidates -> ${banner}`,
    );
    return { banner, logo: fallback.logo };
  } catch (err) {
    console.error(`${tag} TMDB call threw an error:`, err.message);
  }

  return fallback;
};

/*
============================================================
DEBUG: CHECK TMDB BANNER RESOLUTION
============================================================

GET /api/franchises/debug/banners

Temporary diagnostic route — walks every default franchise and
reports exactly why each one's TMDB banner lookup succeeds or
fails (bad API key, wrong collection/company id, no backdrop
available, etc). Hit this in your browser or Postman, read the
JSON, then delete this route + the matching one in your routes
file once you're done debugging.
============================================================
*/

exports.debugBanners = async (req, res) => {
  const report = [];

  for (const f of DEFAULT_FRANCHISES) {
    let status = "";
    try {
      const candidates = await gatherCandidateMovies(f);
      const best = pickBestMovie(candidates);

      status = best
        ? `OK -> picked "${best.title}" (popularity ${best.popularity}) out of ${candidates.length} candidate(s), backdrop: ${best.backdrop_path}`
        : `NO USABLE BACKDROP -> got ${candidates.length} candidate(s) but none had a backdrop_path${
            candidates.length === 0
              ? " (zero candidates usually means a wrong tmdbCollectionId/tmdbCompanyId, or a keyword search that matched nothing)"
              : ""
          }`;
    } catch (err) {
      status = `THREW: ${err.message}`;
    }

    report.push({ slug: f.slug, sourceType: f.sourceType, status });
  }

  res.status(200).json({ report });
};

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
    SYNC REAL FOLLOWS COUNT
    ----------------------------------------------------------
    */

    const followCounts = await FranchiseFollow.aggregate([
      {
        $group: {
          _id: "$franchise",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map();
    followCounts.forEach((fc) => {
      countMap.set(fc._id.toString(), fc.count);
    });

    franchises.forEach((franchise) => {
      const realCount = countMap.get(franchise._id.toString()) || 0;
      if (franchise.followers !== realCount) {
        franchise.followers = realCount;
        Franchise.updateOne(
          { _id: franchise._id },
          { $set: { followers: realCount } },
        ).exec();
      }
    });

    if (!sort || sort === "followers") {
      franchises.sort((a, b) => (b.followers || 0) - (a.followers || 0));
    }

    /*
    ----------------------------------------------------------
    AUTO-HEAL BANNERS ON EVERY FETCH  (TEMPORARY)
    ----------------------------------------------------------

    Re-resolves every franchise's banner from TMDB on each
    request and persists it if it changed. This exists purely
    so that reloading the franchise list page is enough to fix
    stale/broken banners — no separate POST /seed call needed.

    This does add one round of TMDB calls per franchise per
    request, which is fine for dev/small traffic but wasteful
    long-term. Once you've confirmed images are correct, either
    delete this block (and rely on /seed for future refreshes)
    or gate it behind a `?refreshBanners=true` query param.
    ----------------------------------------------------------
    */

    franchises = await Promise.all(
      franchises.map(async (franchise) => {
        try {
          const { banner, logo } = await resolveBannerAndLogo(franchise);
          if (banner && banner !== franchise.banner) {
            franchise.banner = banner;
            if (logo) franchise.logo = logo;
            await franchise.save();
          }
        } catch (err) {
          console.error(
            `Auto-heal banner failed for "${franchise.slug}":`,
            err.message,
          );
        }
        return franchise;
      }),
    );

    /*
    ----------------------------------------------------------
    AUTO SEED
    ----------------------------------------------------------

    If database is completely empty, insert default
    franchises automatically — resolving each one's banner
    from TMDB first so the very first paint has real images.
    */

    if (franchises.length === 0 && !sourceType) {
      const totalCount = await Franchise.countDocuments();

      if (totalCount === 0) {
        const resolved = [];
        for (const franchise of DEFAULT_FRANCHISES) {
          const { banner, logo } = await resolveBannerAndLogo(franchise);
          resolved.push({ ...franchise, banner, logo, followers: 0 });
        }

        await Franchise.insertMany(resolved);

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

This updates existing default franchises as well — call this
again any time to re-resolve banners against live TMDB data
(e.g. right now, to fix the broken images already in the DB).
*/

exports.seedFranchises = async (req, res) => {
  try {
    for (const franchise of DEFAULT_FRANCHISES) {
      const { banner, logo } = await resolveBannerAndLogo(franchise);

      const existing = await Franchise.findOne({ slug: franchise.slug });
      let realFollowers = 0;
      if (existing) {
        realFollowers = await FranchiseFollow.countDocuments({
          franchise: existing._id,
        });
      }

      await Franchise.updateOne(
        {
          slug: franchise.slug,
        },
        {
          $set: { ...franchise, banner, logo, followers: realFollowers },
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

    const realFollowers = await FranchiseFollow.countDocuments({
      franchise: franchise._id,
    });

    if (franchise.followers !== realFollowers) {
      franchise.followers = realFollowers;
      await Franchise.updateOne(
        { _id: franchise._id },
        { $set: { followers: realFollowers } },
      );
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

    const fetchAllPages = async (endpoint, params = {}, maxPages = 3) => {
      const allResults = [];
      try {
        const firstPage = await fetchFromTMDB(endpoint, {
          ...params,
          page: 1,
        });
        allResults.push(...(firstPage.results || []));

        const totalPages = Math.min(firstPage.total_pages || 1, maxPages);
        if (totalPages > 1) {
          const pagePromises = [];
          for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(
              fetchFromTMDB(endpoint, { ...params, page }).catch(() => ({
                results: [],
              })),
            );
          }
          const pageResponses = await Promise.all(pagePromises);
          for (const res of pageResponses) {
            allResults.push(...(res.results || []));
          }
        }
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err.message);
      }
      return allResults;
    };

    /*
    ==========================================================
    1. PRIMARY FETCH: COLLECTION / COMPANY
    ==========================================================
    */
    if (franchise.sourceType === "collection" && franchise.tmdbCollectionId) {
      try {
        const collection = await fetchFromTMDB(
          `/collection/${franchise.tmdbCollectionId}`,
        );
        if (collection && collection.parts) {
          results.push(
            ...collection.parts.map((movie) => ({
              ...movie,
              media_type: "movie",
            })),
          );
        }
      } catch (err) {
        console.error("Collection fetch error:", err.message);
      }
    }

    if (franchise.sourceType === "company" && franchise.tmdbCompanyId) {
      try {
        const [movies, shows] = await Promise.all([
          fetchAllPages("/discover/movie", {
            with_companies: franchise.tmdbCompanyId,
            sort_by: "primary_release_date.desc",
            include_adult: false,
          }),
          fetchAllPages("/discover/tv", {
            with_companies: franchise.tmdbCompanyId,
            sort_by: "first_air_date.desc",
            include_adult: false,
          }),
        ]);
        results.push(...movies.map((m) => ({ ...m, media_type: "movie" })));
        results.push(...shows.map((s) => ({ ...s, media_type: "tv" })));
      } catch (err) {
        console.error("Company fetch error:", err.message);
      }
    }

    /*
    ==========================================================
    2. KEYWORD & SUPPLEMENTARY FETCH
    ==========================================================
    Fetch movies and TV shows using specified keywords.
    */
    if (
      franchise.sourceType === "keyword" &&
      Array.isArray(franchise.keywords)
    ) {
      const kwPromises = franchise.keywords.map(async (keyword) => {
        const [kwMovies, kwShows] = await Promise.all([
          fetchAllPages("/search/movie", {
            query: keyword,
            include_adult: false,
          }),
          fetchAllPages("/search/tv", { query: keyword, include_adult: false }),
        ]);
        return [
          ...kwMovies.map((m) => ({ ...m, media_type: "movie" })),
          ...kwShows.map((s) => ({ ...s, media_type: "tv" })),
        ];
      });

      const kwResults = await Promise.all(kwPromises);
      for (const items of kwResults) {
        results.push(...items);
      }
    }

    /*
    ==========================================================
    REMOVE DUPLICATES
    ==========================================================
    */
    results = Array.from(
      new Map(
        results.map((item) => [`${item.media_type}-${item.id}`, item]),
      ).values(),
    );

    /*
    ==========================================================
    STRICT RELEVANCE FILTERING
    ==========================================================
    Filter out unrelated random movies and shows that matched generic terms.
    */
    const slug = franchise.slug;

    results = results.filter((item) => {
      const title = (item.title || item.name || "").toLowerCase();
      const originalTitle = (
        item.original_title ||
        item.original_name ||
        ""
      ).toLowerCase();
      const overview = (item.overview || "").toLowerCase();
      const fullText = `${title} ${originalTitle} ${overview}`;

      if (slug === "marvel-cinematic-universe") {
        const marvelTerms = [
          "marvel",
          "avengers",
          "iron man",
          "spider-man",
          "spiderman",
          "captain america",
          "thor",
          "guardians of the galaxy",
          "doctor strange",
          "black panther",
          "ant-man",
          "deadpool",
          "wolverine",
          "loki",
          "wandavision",
          "hawkeye",
          "moon knight",
          "she-hulk",
          "ms. marvel",
          "secret invasion",
          "echo",
          "agatha",
          "daredevil",
          "fantastic four",
          "x-men",
          "blade",
          "black widow",
          "shang-chi",
          "eternals",
        ];
        return marvelTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "star-wars-saga") {
        const swTerms = [
          "star wars",
          "mandalorian",
          "andor",
          "ahsoka",
          "obi-wan",
          "bad batch",
          "rogue one",
          "boba fett",
          "solo: a star wars",
          "skeleton crew",
          "acolyte",
        ];
        return swTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "lord-of-the-rings") {
        const lotrTerms = [
          "lord of the rings",
          "hobbit",
          "rings of power",
          "middle-earth",
          "rohirrim",
        ];
        return lotrTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "harry-potter") {
        const hpTerms = [
          "harry potter",
          "fantastic beasts",
          "hogwarts",
          "dumbledore",
          "philosophical stone",
          "sorcerer's stone",
        ];
        return hpTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "batman-universe") {
        const batmanTerms = [
          "batman",
          "dark knight",
          "joker",
          "penguin",
          "gotham",
          "catwoman",
          "harley quinn",
          "batwoman",
        ];
        return batmanTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "spiderman-universe") {
        const spideyTerms = [
          "spider-man",
          "spiderman",
          "spider-verse",
          "venom",
          "morbius",
          "madame web",
          "kraven",
        ];
        return spideyTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "dc-multiverse") {
        const dcTerms = [
          "justice league",
          "superman",
          "batman",
          "wonder woman",
          "aquaman",
          "flash",
          "suicide squad",
          "shazam",
          "black adam",
          "peacemaker",
          "blue beetle",
        ];
        return dcTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "fast-and-furious") {
        const fastTerms = [
          "fast & furious",
          "fast and furious",
          "fast x",
          "hobbs & shaw",
          "tokyo drift",
          "2 fast 2 furious",
        ];
        return fastTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "james-bond") {
        const bondTerms = [
          "james bond",
          "007",
          "casino royale",
          "skyfall",
          "no time to die",
          "spectre",
          "quantum of solace",
          "goldfinger",
          "goldeneye",
        ];
        return bondTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "jurassic-park") {
        return title.includes("jurassic");
      }

      if (slug === "monsterverse") {
        const mvTerms = [
          "godzilla",
          "king kong",
          "kong:",
          "monsterverse",
          "monarch",
        ];
        return mvTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      if (slug === "transformers") {
        const tfTerms = [
          "transformers",
          "bumblebee",
          "rise of the beasts",
          "beast wars",
        ];
        return tfTerms.some(
          (term) => title.includes(term) || originalTitle.includes(term),
        );
      }

      return true;
    });

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
    RESOLVE BANNER FROM TMDB IF NOT PROVIDED
    ----------------------------------------------------------
    */

    let resolvedBanner = banner;
    if (!resolvedBanner) {
      const resolved = await resolveBannerAndLogo({
        slug,
        sourceType,
        tmdbCollectionId,
        tmdbCompanyId,
        keywords,
        banner: "",
        logo: "",
      });
      resolvedBanner = resolved.banner;
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
      banner: resolvedBanner,
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
    UPDATE REAL FOLLOWERS COUNT
    ----------------------------------------------------------
    */

    const realFollowers = await FranchiseFollow.countDocuments({
      franchise: franchiseId,
    });

    await Franchise.findByIdAndUpdate(franchiseId, {
      $set: {
        followers: realFollowers,
      },
    });

    res.status(200).json({
      success: true,
      message: "Franchise followed successfully",
      followers: realFollowers,
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
    UPDATE REAL FOLLOWERS COUNT
    ----------------------------------------------------------
    */

    const realFollowers = await FranchiseFollow.countDocuments({
      franchise: franchiseId,
    });

    await Franchise.findByIdAndUpdate(franchiseId, {
      $set: {
        followers: realFollowers,
      },
    });

    res.status(200).json({
      success: true,
      message: "Franchise unfollowed successfully",
      followers: realFollowers,
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
