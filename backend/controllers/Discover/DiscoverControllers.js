const { fetchFromTMDB } = require("../../ultils/tmdbService");

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

  if (range === "month") {
    end.setMonth(end.getMonth() + 1);
  } else if (range === "nextMonth") {
    start.setMonth(start.getMonth() + 1);
    end = new Date(start);
    end.setMonth(end.getMonth() + 1);
  } else if (range === "year") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 3);
  }

  return {
    start: getDateString(start),
    end: getDateString(end),
  };
};

/*
|--------------------------------------------------------------------------
| UPCOMING
|--------------------------------------------------------------------------
*/

exports.getUpcoming = async (req, res) => {
  try {
    const { type = "all", range = "month", page = 1 } = req.query;

    const cacheKey = `upcoming-${type}-${range}-${page}`;

    const cached = getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const { start, end } = getDateRange(range);

    const requests = [];

    /*
    |--------------------------------------------------------------------------
    | MOVIES
    |--------------------------------------------------------------------------
    */

    if (type === "movie" || type === "all") {
      requests.push(
        fetchFromTMDB("/discover/movie", {
          page,
          "release_date.gte": start,
          "release_date.lte": end,
          sort_by: "primary_release_date.asc",
          include_adult: false,
          include_video: true,
        }).then((data) => ({
          type: "movie",
          results: data.results.map((item) => ({
            ...item,
            media_type: "movie",
          })),
        })),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | TV
    |--------------------------------------------------------------------------
    */

    if (type === "tv" || type === "all") {
      requests.push(
        fetchFromTMDB("/discover/tv", {
          page,
          "first_air_date.gte": start,
          "first_air_date.lte": end,
          sort_by: "first_air_date.asc",
          include_adult: false,
        }).then((data) => ({
          type: "tv",
          results: data.results.map((item) => ({
            ...item,
            media_type: "tv",
          })),
        })),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ANIME
    |--------------------------------------------------------------------------
    */

    if (type === "anime" || type === "all") {
      requests.push(
        fetchFromTMDB("/discover/tv", {
          page,
          "first_air_date.gte": start,
          "first_air_date.lte": end,
          sort_by: "first_air_date.asc",
          with_genres: 16,
          with_original_language: "ja",
          include_adult: false,
        }).then((data) => ({
          type: "anime",
          results: data.results.map((item) => ({
            ...item,
            media_type: "anime",
          })),
        })),
      );
    }

    const responses = await Promise.allSettled(requests);

    const results = responses
      .filter((item) => item.status === "fulfilled")
      .flatMap((item) => item.value.results);

    results.sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";

      return new Date(dateA) - new Date(dateB);
    });

    const response = {
      results,
      page: Number(page),
      range,
      start,
      end,
    };

    setCache(cacheKey, response);

    res.json(response);
  } catch (error) {
    console.error("Upcoming API Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch upcoming media",
    });
  }
};

/*
|--------------------------------------------------------------------------
| RELEASE CALENDAR
|--------------------------------------------------------------------------
*/

exports.getReleaseCalendar = async (req, res) => {
  try {
    const { date, type = "all" } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required",
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
          data.results.map((item) => ({
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
          data.results.map((item) => ({
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
          data.results.map((item) => ({
            ...item,
            media_type: "anime",
            release_date: item.first_air_date,
          })),
        ),
      );
    }

    const responses = await Promise.allSettled(requests);

    const results = responses
      .filter((item) => item.status === "fulfilled")
      .flatMap((item) => item.value);

    const response = {
      date,
      results,
    };

    setCache(cacheKey, response);

    res.json(response);
  } catch (error) {
    console.error("Calendar API Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch release calendar",
    });
  }
};

/*
|--------------------------------------------------------------------------
| NEW TRAILERS
|--------------------------------------------------------------------------
|
| We deliberately only inspect a small number of upcoming titles.
| Do NOT request videos for 20-40 titles on every page load.
|--------------------------------------------------------------------------
*/

exports.getUpcomingTrailers = async (req, res) => {
  try {
    const { type = "all", range = "month", page = 1 } = req.query;

    const cacheKey = `trailers-${type}-${range}-${page}`;

    const cached = getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const { start, end } = getDateRange(range);

    let endpoint;
    let params;

    if (type === "movie") {
      endpoint = "/discover/movie";

      params = {
        page,
        "release_date.gte": start,
        "release_date.lte": end,
        sort_by: "popularity.desc",
      };
    } else {
      endpoint = "/discover/tv";

      params = {
        page,
        "first_air_date.gte": start,
        "first_air_date.lte": end,
        sort_by: "popularity.desc",
      };

      if (type === "anime") {
        params.with_genres = 16;
        params.with_original_language = "ja";
      }
    }

    const data = await fetchFromTMDB(endpoint, params);

    /*
    |--------------------------------------------------------------------------
    | Only inspect first 6 titles.
    |--------------------------------------------------------------------------
    */

    const titles = data.results.slice(0, 6);

    const trailers = [];

    for (const item of titles) {
      try {
        const detailEndpoint =
          endpoint === "/discover/movie"
            ? `/movie/${item.id}`
            : `/tv/${item.id}`;

        const details = await fetchFromTMDB(detailEndpoint, {
          append_to_response: "videos",
        });

        const videos = details.videos?.results || [];

        const trailer = videos.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official === true,
        );

        if (trailer) {
          trailers.push({
            ...item,
            media_type:
              endpoint === "/discover/movie"
                ? "movie"
                : type === "anime"
                  ? "anime"
                  : "tv",
            trailer,
          });
        }
      } catch (error) {
        console.error(`Trailer fetch failed for ${item.id}:`, error.message);
      }
    }

    const response = {
      results: trailers,
    };

    setCache(cacheKey, response);

    res.json(response);
  } catch (error) {
    console.error("Trailer API Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch trailers",
    });
  }
};
