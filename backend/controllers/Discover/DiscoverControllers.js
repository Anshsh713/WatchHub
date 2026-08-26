const { fetchFromTMDB } = require("../../ultils/tmdbService");
const WatchHubAnnouncement = require("../../models/WatchHub_Announcement_model");
const Franchise = require("../../models/Franchise/Franchise");
const FranchiseFollow = require("../../models/Franchise/Franchise_Following");
const MediaReview = require("../../models/Media_Reviews");

const discoverCache = new Map();
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

const getCache = (key) => {
  const cached = discoverCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TIME) {
    discoverCache.delete(key);
    return null;
  }
  return cached.data;
};

const setCache = (key, data) => {
  discoverCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

const getDateString = (date) => {
  return date.toISOString().split("T")[0];
};

const getDateRange = (range) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  let end = new Date(now);

  if (range === "today") {
    // Exact day: today
    return {
      start: getDateString(start),
      end: getDateString(start),
    };
  } else if (range === "week" || range === "thisWeek") {
    // Next 7 days
    end.setDate(end.getDate() + 7);
    return {
      start: getDateString(start),
      end: getDateString(end),
    };
  } else if (range === "month" || range === "thisMonth") {
    // Current month: from today until the end of current calendar month,
    // or at least 21 days ahead
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const minDays = new Date(now);
    minDays.setDate(minDays.getDate() + 25);
    end = endOfMonth > minDays ? endOfMonth : minDays;
  } else if (range === "nextMonth") {
    // Next calendar month: 1st day of next month to last day of next month
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      start: getDateString(nextMonthStart),
      end: getDateString(nextMonthEnd),
    };
  } else if (range === "upcoming" || range === "future" || range === "moreThan2Months") {
    // Upcoming media starting 2 months from now (> 60 days) to 2 years ahead
    const twoMonthsAhead = new Date(now);
    twoMonthsAhead.setDate(twoMonthsAhead.getDate() + 60);
    const farFuture = new Date(now);
    farFuture.setFullYear(farFuture.getFullYear() + 2);
    return {
      start: getDateString(twoMonthsAhead),
      end: getDateString(farFuture),
    };
  } else if (range === "year") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    // Default 3 months window
    end.setMonth(end.getMonth() + 3);
  }

  return {
    start: getDateString(start),
    end: getDateString(end),
  };
};

/*
|--------------------------------------------------------------------------
| 1. UPCOMING MEDIA (Today, Week, This Month, Next Month, Upcoming 2+ Months)
|--------------------------------------------------------------------------
*/
exports.getUpcoming = async (req, res) => {
  try {
    const { type = "all", range = "month", page = 1, sort = "auto" } = req.query;
    const cacheKey = `upcoming-${type}-${range}-${page}-${sort}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const { start, end } = getDateRange(range);
    const requests = [];
    const pagesToFetch = [Number(page), Number(page) + 1]; // Fetch 2 pages for abundant slider items

    // 1. MOVIES
    if (type === "movie" || type === "all") {
      pagesToFetch.forEach((p) => {
        requests.push(
          fetchFromTMDB("/discover/movie", {
            page: p,
            "primary_release_date.gte": start,
            "primary_release_date.lte": end,
            sort_by: range === "today" ? "popularity.desc" : "primary_release_date.asc",
            include_adult: false,
            include_video: true,
          }).then((data) => ({
            type: "movie",
            results: (data.results || []).map((item) => ({
              ...item,
              media_type: "movie",
              release_date: item.release_date || item.first_air_date || null,
            })),
          })),
        );
      });
    }

    // 2. TV SHOWS
    if (type === "tv" || type === "all") {
      pagesToFetch.forEach((p) => {
        requests.push(
          fetchFromTMDB("/discover/tv", {
            page: p,
            "first_air_date.gte": start,
            "first_air_date.lte": end,
            sort_by: range === "today" ? "popularity.desc" : "first_air_date.asc",
            include_adult: false,
          }).then((data) => ({
            type: "tv",
            results: (data.results || []).map((item) => ({
              ...item,
              media_type: "tv",
              release_date: item.first_air_date || null,
            })),
          })),
        );
      });
    }

    // 3. ANIME (using WatchHub anime logic: tv endpoint + genre 16 + original_language ja)
    if (type === "anime" || type === "all") {
      pagesToFetch.forEach((p) => {
        requests.push(
          fetchFromTMDB("/discover/tv", {
            page: p,
            "first_air_date.gte": start,
            "first_air_date.lte": end,
            sort_by: range === "today" ? "popularity.desc" : "first_air_date.asc",
            with_genres: 16,
            with_original_language: "ja",
            include_adult: false,
          }).then((data) => ({
            type: "anime",
            results: (data.results || []).map((item) => ({
              ...item,
              media_type: "anime",
              release_date: item.first_air_date || null,
            })),
          })),
        );
      });
    }

    const responses = await Promise.allSettled(requests);

    let results = responses
      .filter((item) => item.status === "fulfilled")
      .flatMap((item) => item.value.results);

    // Deduplicate by media_type and id
    const seen = new Set();
    results = results.filter((item) => {
      const key = `${item.media_type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Custom sorting:
    // If range is month or nextMonth, sort in descending order (31 days left to today)
    if (range === "month" || range === "thisMonth" || range === "nextMonth" || sort === "desc") {
      results.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || "1970-01-01");
        const dateB = new Date(b.release_date || b.first_air_date || "1970-01-01");
        return dateB - dateA; // Descending (farthest date down to closest/today)
      });
    } else if (range === "today") {
      results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else {
      // Ascending (soonest first)
      results.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || "9999-12-31");
        const dateB = new Date(b.release_date || b.first_air_date || "9999-12-31");
        return dateA - dateB;
      });
    }

    const response = {
      success: true,
      results,
      page: Number(page),
      range,
      start,
      end,
      totalResults: results.length,
    };

    setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error("Upcoming API Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming media",
      results: [],
    });
  }
};

/*
|--------------------------------------------------------------------------
| 2. RELEASE CALENDAR
|--------------------------------------------------------------------------
*/
exports.getReleaseCalendar = async (req, res) => {
  try {
    const { date, type = "all" } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter (YYYY-MM-DD) is required",
      });
    }

    const cacheKey = `calendar-${date}-${type}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const requests = [];

    if (type === "movie" || type === "all") {
      requests.push(
        fetchFromTMDB("/discover/movie", {
          "primary_release_date.gte": date,
          "primary_release_date.lte": date,
          include_adult: false,
          sort_by: "popularity.desc",
        }).then((data) =>
          (data.results || []).map((item) => ({
            ...item,
            media_type: "movie",
            release_date: item.release_date,
          })),
        ),
      );
    }

    if (type === "tv" || type === "all") {
      requests.push(
        fetchFromTMDB("/discover/tv", {
          "first_air_date.gte": date,
          "first_air_date.lte": date,
          include_adult: false,
          sort_by: "popularity.desc",
        }).then((data) =>
          (data.results || []).map((item) => ({
            ...item,
            media_type: "tv",
            release_date: item.first_air_date,
          })),
        ),
      );
    }

    if (type === "anime" || type === "all") {
      requests.push(
        fetchFromTMDB("/discover/tv", {
          "first_air_date.gte": date,
          "first_air_date.lte": date,
          with_genres: 16,
          with_original_language: "ja",
          include_adult: false,
        }).then((data) =>
          (data.results || []).map((item) => ({
            ...item,
            media_type: "anime",
            release_date: item.first_air_date,
          })),
        ),
      );
    }

    const responses = await Promise.allSettled(requests);

    let results = responses
      .filter((item) => item.status === "fulfilled")
      .flatMap((item) => item.value);

    // Deduplicate
    const seen = new Set();
    results = results.filter((item) => {
      const key = `${item.media_type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const response = {
      success: true,
      date,
      results,
      count: results.length,
    };

    setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error("Calendar API Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch release calendar",
      results: [],
    });
  }
};

/*
|--------------------------------------------------------------------------
| 3. NEW TRAILERS
|--------------------------------------------------------------------------
*/
exports.getUpcomingTrailers = async (req, res) => {
  try {
    const { type = "all", range = "year", page = 1 } = req.query;
    const cacheKey = `trailers-${type}-${range}-${page}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const { start, end } = getDateRange(range);
    const candidateRequests = [];

    // Search upcoming movies
    candidateRequests.push(
      fetchFromTMDB("/discover/movie", {
        page,
        "primary_release_date.gte": start,
        "primary_release_date.lte": end,
        sort_by: "popularity.desc",
      }).then((data) =>
        (data.results || []).slice(0, 10).map((m) => ({ ...m, media_type: "movie" })),
      ),
    );

    // Search upcoming TV
    candidateRequests.push(
      fetchFromTMDB("/discover/tv", {
        page,
        "first_air_date.gte": start,
        "first_air_date.lte": end,
        sort_by: "popularity.desc",
      }).then((data) =>
        (data.results || []).slice(0, 10).map((t) => ({ ...t, media_type: "tv" })),
      ),
    );

    // Search upcoming Anime
    candidateRequests.push(
      fetchFromTMDB("/discover/tv", {
        page,
        "first_air_date.gte": start,
        "first_air_date.lte": end,
        with_genres: 16,
        with_original_language: "ja",
        sort_by: "popularity.desc",
      }).then((data) =>
        (data.results || []).slice(0, 8).map((a) => ({ ...a, media_type: "anime" })),
      ),
    );

    const candidateResponses = await Promise.allSettled(candidateRequests);
    const candidates = candidateResponses
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .slice(0, 18);

    const videoRequests = candidates.map((item) => {
      const endpoint = item.media_type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
      return fetchFromTMDB(endpoint, { append_to_response: "videos" })
        .then((details) => {
          const videos = details.videos?.results || [];
          const trailer =
            videos.find(
              (v) =>
                v.site === "YouTube" &&
                (v.type === "Trailer" || v.type === "Teaser") &&
                v.official === true,
            ) ||
            videos.find(
              (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
            );

          if (trailer) {
            return {
              id: item.id,
              title: item.title || item.name,
              media_type: item.media_type,
              release_date: item.release_date || item.first_air_date,
              poster_path: item.poster_path,
              backdrop_path: item.backdrop_path,
              overview: item.overview,
              trailer: {
                key: trailer.key,
                name: trailer.name,
                type: trailer.type,
                official: trailer.official,
                published_at: trailer.published_at,
              },
            };
          }
          return null;
        })
        .catch(() => null);
    });

    const settledVideos = await Promise.allSettled(videoRequests);
    const trailers = settledVideos
      .filter((v) => v.status === "fulfilled" && v.value !== null)
      .map((v) => v.value);

    const response = {
      success: true,
      results: trailers,
    };

    setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error("Trailer API Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trailers",
      results: [],
    });
  }
};

/*
|--------------------------------------------------------------------------
| 4. FOLLOWED FRANCHISE UPDATES
|--------------------------------------------------------------------------
*/
exports.getFranchiseUpdates = async (req, res) => {
  try {
    let followedSlugs = [];

    if (req.user?._id) {
      const follows = await FranchiseFollow.find({ user: req.user._id })
        .populate("franchise", "name slug logo banner")
        .lean();

      followedSlugs = follows.map((f) => f.franchise?.slug).filter(Boolean);
    }

    let isPersonalized = followedSlugs.length > 0;
    let filter = {};

    if (isPersonalized) {
      filter.franchiseSlug = { $in: followedSlugs };
    }

    let updates = await WatchHubAnnouncement.find(filter)
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean();

    // Fallback: If no updates found or user follows none, fetch latest major franchise updates
    if (updates.length === 0) {
      updates = await WatchHubAnnouncement.find({
        franchiseSlug: { $ne: null },
      })
        .sort({ publishedAt: -1 })
        .limit(8)
        .lean();
      isPersonalized = false;
    }

    // Attach franchise metadata
    const enrichedUpdates = await Promise.all(
      updates.map(async (u) => {
        let franchiseInfo = null;
        if (u.franchiseSlug) {
          franchiseInfo = await Franchise.findOne({ slug: u.franchiseSlug })
            .select("name slug logo banner")
            .lean();
        }
        return {
          ...u,
          franchise: franchiseInfo,
        };
      }),
    );

    res.json({
      success: true,
      isPersonalized,
      results: enrichedUpdates,
    });
  } catch (error) {
    console.error("Franchise Updates Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch franchise updates",
      results: [],
    });
  }
};

/*
|--------------------------------------------------------------------------
| 5. TRENDING DISCUSSIONS
|--------------------------------------------------------------------------
*/
exports.getTrendingDiscussions = async (req, res) => {
  try {
    const defaultUpcomingDiscussions = [
      {
        id: "dune-part-three",
        mediaId: 1125510,
        mediaType: "movie",
        title: "Dune: Part Three (Dune Messiah)",
        posterPath: "/czembW0Rk1Ke7des6MmFRumKdYp.jpg",
        releaseDate: "2026-12-18",
        totalDiscussions: 182,
        totalReactions: 1450,
        trendingTopic: "Do you think Messiah will surpass Part Two in scale?",
        recentComments: [
          {
            user: "SciFiEnthusiast",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SciFi",
            text: "Denis Villeneuve handling Paul's tragic downfall will be peak cinema.",
            rating: "Perfection",
            time: "2 hours ago",
          },
          {
            user: "ArrakisWanderer",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arrakis",
            text: "The ending of Messiah is one of the most poignant moments in literature.",
            rating: "Go for it",
            time: "5 hours ago",
          },
        ],
      },
      {
        id: "avengers-doomsday",
        mediaId: 1022789,
        mediaType: "movie",
        title: "Avengers: Doomsday",
        posterPath: "/1Q5b7g47t8lQpUeU6qV74wRj1lF.jpg",
        releaseDate: "2026-05-01",
        totalDiscussions: 420,
        totalReactions: 3100,
        trendingTopic: "How will the MCU handle RDJ playing Doctor Doom across universes?",
        recentComments: [
          {
            user: "MarvelTheorist",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marvel",
            text: "The Russo brothers directed Infinity War & Endgame; Doomsday is in great hands.",
            rating: "Perfection",
            time: "1 hour ago",
          },
          {
            user: "ComicsGuru",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Comics",
            text: "Doctor Doom vs Fantastic Four and the entire multiverse will be incredible.",
            rating: "Go for it",
            time: "3 hours ago",
          },
        ],
      },
      {
        id: "stranger-things-5",
        mediaId: 66732,
        mediaType: "tv",
        title: "Stranger Things (Season 5)",
        posterPath: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        releaseDate: "2026-10-31",
        totalDiscussions: 275,
        totalReactions: 2200,
        trendingTopic: "Final Season Theories: Who will make the ultimate sacrifice?",
        recentComments: [
          {
            user: "HawkinsSurvivor",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hawkins",
            text: "The Upside Down lore needs full closure. Can't wait for the feature-length episodes.",
            rating: "Perfection",
            time: "4 hours ago",
          },
        ],
      },
      {
        id: "chainsaw-man-reze",
        mediaId: 1011985,
        mediaType: "anime",
        title: "Chainsaw Man – The Movie: Reze Arc",
        posterPath: "/kXfq3nuL279XZtp0z71bE.jpg",
        releaseDate: "2026-09-20",
        totalDiscussions: 310,
        totalReactions: 1980,
        trendingTopic: "MAPPA theatrical animation quality will break the box office.",
        recentComments: [
          {
            user: "AnimeOtaku99",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Otaku",
            text: "The Reze arc in the manga is pure masterpiece storytelling and adrenaline.",
            rating: "Perfection",
            time: "30 mins ago",
          },
        ],
      },
    ];

    res.json({
      success: true,
      results: defaultUpcomingDiscussions,
    });
  } catch (error) {
    console.error("Trending Discussions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending discussions",
      results: [],
    });
  }
};
