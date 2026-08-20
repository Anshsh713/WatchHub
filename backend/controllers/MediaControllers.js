const { fetchFromTMDB } = require("../ultils/tmdbService");

const memCache = {};

exports.getMedia = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;

    let endpoint = "";
    let params = { page };

    if (type === "movie") {
      endpoint = "/discover/movie";
    } else if (type === "tv") {
      endpoint = "/discover/tv";
    } else if (type === "anime") {
      endpoint = "/discover/tv";
      params.with_genres = 16;
      params.with_original_language = "ja";
    } else if (type === "all") {
      endpoint = "/trending/all/week";
    } else {
      return res.status(400).json({ message: "Invalid media type" });
    }

    const data = await fetchFromTMDB(endpoint, params);

    res.json(data);
  } catch (error) {
    console.error("TMDB ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

exports.getMediaDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!id || !type) {
      return res.status(400).json({ message: "Missing id or type" });
    }

    const originalType = type;
    const mediaType = type === "anime" ? "tv" : type;

    const details = await fetchFromTMDB(`/${mediaType}/${id}`);
    const credits = await fetchFromTMDB(`/${mediaType}/${id}/credits`);

    let videos = { results: [] };
    let providers = { results: {} };
    let releaseDates = null;

    try {
      videos = await fetchFromTMDB(`/${mediaType}/${id}/videos`);
    } catch (e) {
      console.log("Videos not found");
    }

    try {
      providers = await fetchFromTMDB(`/${mediaType}/${id}/watch/providers`);
    } catch (e) {
      console.log("Providers not found");
    }

    if (mediaType === "movie") {
      try {
        releaseDates = await fetchFromTMDB(`/${mediaType}/${id}/release_dates`);
      } catch (e) {
        console.log("Release dates not found");
      }
    }

    const trailer = videos.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube",
    );

    let directorName = null;

    if (mediaType === "movie") {
      directorName =
        credits.crew?.find((p) => p.job === "Director")?.name || null;
    } else {
      directorName =
        details.created_by?.[0]?.name ||
        credits.crew?.find((p) => p.job === "Series Director")?.name ||
        credits.crew?.find((p) => p.job === "Director")?.name ||
        credits.crew?.find((p) => p.job === "Original Story")?.name ||
        credits.crew?.find((p) => p.job === "Writer")?.name ||
        null;
    }

    let ageRating = null;

    let contentRatings = null;

    if (mediaType === "tv") {
      try {
        contentRatings = await fetchFromTMDB(
          `/${mediaType}/${id}/content_ratings`,
        );
      } catch (e) {
        console.log("Content ratings not found");
      }
    }

    if (mediaType === "movie" && releaseDates?.results) {
      const indiaRelease = releaseDates.results.find(
        (r) => r.iso_3166_1 === "IN",
      );
      ageRating = indiaRelease?.release_dates?.[0]?.certification || null;
    }

    if (mediaType === "tv" && contentRatings?.results) {
      const indiaRating = contentRatings.results.find(
        (r) => r.iso_3166_1 === "IN",
      );
      ageRating = indiaRating?.rating || null;
    }

    if (!ageRating) {
      if (mediaType === "movie" && releaseDates?.results) {
        const usRelease = releaseDates.results.find(
          (r) => r.iso_3166_1 === "US",
        );
        ageRating = usRelease?.release_dates?.[0]?.certification || null;
      }

      if (mediaType === "tv" && contentRatings?.results) {
        const usRating = contentRatings.results.find(
          (r) => r.iso_3166_1 === "US",
        );
        ageRating = usRating?.rating || null;
      }
    }
    if (!ageRating || ageRating.trim() === "") {
      ageRating = "NR";
    }

    let keywords = { keywords: [] };
    let similar = { results: [] };

    try {
      keywords = await fetchFromTMDB(`/${mediaType}/${id}/keywords`);
    } catch (e) {
      console.log("Keywords not found");
    }

    try {
      similar = await fetchFromTMDB(`/${mediaType}/${id}/similar`);
    } catch (e) {
      console.log("Similar titles not found");
    }

    // Normalize keywords (movie vs tv difference)
    const keywordList = keywords.keywords || keywords.results || [];

    const genres = details.genres || [];
    const genreWeightMap = {};

    // Initialize weights
    genres.forEach((g) => {
      genreWeightMap[g.id] = 1; // base weight
    });

    // Boost weight based on similar titles frequency
    similar.results?.forEach((item) => {
      item.genre_ids?.forEach((gid) => {
        if (genreWeightMap[gid] !== undefined) {
          genreWeightMap[gid] += 2;
        }
      });
    });

    // Boost weight if keyword matches genre name
    keywordList.forEach((kw) => {
      genres.forEach((g) => {
        if (kw.name.toLowerCase().includes(g.name.toLowerCase())) {
          genreWeightMap[g.id] += 3;
        }
      });
    });

    // Convert weights to percentage
    const totalWeight = Object.values(genreWeightMap).reduce(
      (a, b) => a + b,
      0,
    );

    const vibeChart = genres.map((g) => ({
      name: g.name,
      percent: Math.round((genreWeightMap[g.id] / totalWeight) * 100),
    }));

    const releaseDate = details.release_date || details.first_air_date;

    const isInTheatre =
      releaseDate &&
      new Date(releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    let duration = null;
    let totalSeasons = null;
    let totalEpisodes = null;
    let episodeRuntime = null;
    let status = details.status || null;

    if (mediaType === "movie") {
      duration = details.runtime;
    } else {
      totalSeasons = details.number_of_seasons;
      totalEpisodes = details.number_of_episodes;
      if (
        Array.isArray(details.episode_run_time) &&
        details.episode_run_time.length > 0
      ) {
        episodeRuntime = Math.max(...details.episode_run_time);
      } else if (details.last_episode_to_air?.runtime) {
        episodeRuntime = details.last_episode_to_air.runtime;
      } else if (details.seasons?.[0]?.episode_count) {
        episodeRuntime = details.seasons[0].episode_run_time?.[0] || null;
      }
    }

    res.json({
      id: details.id,
      type: originalType,
      name: details.title || details.name,
      overview: details.overview,
      tmdb_rating: details.vote_average,

      images: {
        poster: details.poster_path,
        backdrop: details.backdrop_path,
      },

      trailer: trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : null,

      director: directorName,

      country: details.production_countries,
      language: details.original_language,
      ageRating,

      // 🎬 Movie specific
      duration, // minutes

      // 📺 TV / Anime specific
      totalSeasons,
      totalEpisodes,
      episodeRuntime,
      status,

      cast: credits.cast?.slice(0, 10) || [],
      crew: credits.crew || [],

      productionHouses: details.production_companies,

      platforms: providers.results?.IN || null,

      theatreStatus: {
        releaseDate,
        isInTheatre,
      },

      vibeChart,
    });
  } catch (error) {
    console.error("DETAIL ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch media details" });
  }
};

exports.getAllGenres = async (req, res) => {
  try {
    if (memCache["genres"]) {
      return res.json(memCache["genres"]);
    }

    const movieGenres = await fetchFromTMDB("/genre/movie/list");
    const tvGenres = await fetchFromTMDB("/genre/tv/list");

    const map = new Map();

    movieGenres.genres.forEach((g) => map.set(g.id, g));
    tvGenres.genres.forEach((g) => map.set(g.id, g));

    const genres = Array.from(map.values());
    memCache["genres"] = genres;

    res.json(genres);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch genres" });
  }
};

exports.getAllCountries = async (req, res) => {
  try {
    if (memCache["countries"]) {
      return res.json(memCache["countries"]);
    }

    const countries = await fetchFromTMDB("/configuration/countries");

    const result = countries.map((c) => ({
      code: c.iso_3166_1,
      name: c.english_name,
    }));
    memCache["countries"] = result;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch countries" });
  }
};

exports.getAllLanguages = async (req, res) => {
  try {
    if (memCache["languages"]) {
      return res.json(memCache["languages"]);
    }

    const data = await fetchFromTMDB("/configuration/languages");

    const result = data.map((l) => ({
      code: l.iso_639_1,
      name: l.english_name,
    }));
    memCache["languages"] = result;

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch languages" });
  }
};

exports.getMediaByGenre = async (req, res) => {
  try {
    const { genreId, page = 1, mediaType = "all" } = req.query;

    if (!genreId && mediaType !== "anime") {
      return res.status(400).json({ message: "Missing genreId" });
    }

    let params = { page };
    let endpoints = [];

    if (mediaType === "movie") {
      endpoints = ["/discover/movie"];
      params.with_genres = genreId;
    } else if (mediaType === "tv") {
      endpoints = ["/discover/tv"];
      params.with_genres = genreId;
    } else if (mediaType === "anime") {
      endpoints = ["/discover/tv"];
      params.with_genres = genreId ? `${genreId},16` : "16";
      params.with_original_language = "ja";
    } else if (mediaType === "all") {
      endpoints = ["/discover/movie", "/discover/tv"];
      params.with_genres = genreId;
    } else {
      return res.status(400).json({ message: "Invalid mediaType" });
    }

    const results = await Promise.allSettled(
      endpoints.map((ep) => fetchFromTMDB(ep, params)),
    );

    let merged = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value.results);

    merged = merged.map((item) => ({
      ...item,
      media_type: item.first_air_date ? "tv" : "movie",
    }));

    res.json({
      results: merged,
      page: Number(page),
    });
  } catch (error) {
    console.error("Genre API Error:", error.message);
    res.status(500).json({ message: "Failed to fetch media by genre" });
  }
};

exports.getMediaByCountry = async (req, res) => {
  try {
    const { countryCode, page = 1, mediaType = "all" } = req.query;

    if (!countryCode) {
      return res.status(400).json({ message: "Missing countryCode" });
    }

    let params = { page };
    let endpoints = [];

    if (mediaType === "movie") {
      endpoints = ["/discover/movie"];
      params.with_origin_country = countryCode;
    } else if (mediaType === "tv") {
      endpoints = ["/discover/tv"];
      params.with_origin_country = countryCode;
    } else if (mediaType === "anime") {
      endpoints = ["/discover/tv"];
      params.with_origin_country = countryCode;
      params.with_genres = 16;
      params.with_original_language = "ja";
    } else if (mediaType === "all") {
      endpoints = ["/discover/movie", "/discover/tv"];
      params.with_origin_country = countryCode;
    } else {
      return res.status(400).json({ message: "Invalid mediaType" });
    }

    let results = await Promise.allSettled(
      endpoints.map((ep) => fetchFromTMDB(ep, params)),
    );

    let merged = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value.results);
    res.json({
      results: merged,
      page: Number(page),
    });
  } catch (error) {
    console.error("Country API Error:", error.message);
    res.status(500).json({ message: "Failed to fetch media by country" });
  }
};

exports.getMediaByLanguage = async (req, res) => {
  try {
    const { languageCode, page = 1, mediaType = "all" } = req.query;

    if (!languageCode) {
      return res.status(400).json({
        message: "Missing languageCode",
      });
    }

    let params = {
      page,
      with_original_language: languageCode,
    };

    let endpoints = [];

    if (mediaType === "movie") {
      endpoints = ["/discover/movie"];
    } else if (mediaType === "tv") {
      endpoints = ["/discover/tv"];
    } else if (mediaType === "anime") {
      endpoints = ["/discover/tv"];

      params.with_genres = 16;
      params.with_original_language = "ja";
    } else if (mediaType === "all") {
      endpoints = ["/discover/movie", "/discover/tv"];
    } else {
      return res.status(400).json({
        message: "Invalid mediaType",
      });
    }

    const results = await Promise.allSettled(
      endpoints.map((ep) => fetchFromTMDB(ep, params)),
    );

    let merged = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value.results);

    merged = merged.map((item) => ({
      ...item,
      media_type: item.first_air_date ? "tv" : "movie",
    }));

    res.json({
      results: merged,
      page: Number(page),
    });
  } catch (error) {
    console.error("Language API Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch media by language",
    });
  }
};

exports.getExploreCategories = async (req, res) => {
  try {
    const { category, page = 1, mediaType = "all" } = req.query;

    let params = {
      page,
      sort_by: "popularity.desc",
      include_adult: false,
    };

    let endpoints = [];

    if (mediaType === "movie") {
      endpoints = ["/discover/movie"];
    } else if (mediaType === "tv") {
      endpoints = ["/discover/tv"];
    } else {
      endpoints = ["/discover/movie", "/discover/tv"];
    }

    switch (category) {
      case "family":
        params.with_genres = "10751";

        params["vote_average.gte"] = 6.5;

        params.sort_by = "popularity.desc";

        break;

      case "awards":
        params["vote_average.gte"] = 7.5;

        params["vote_count.gte"] = 500;

        params.sort_by = "vote_average.desc";

        break;

      case "gems":
        params["vote_average.gte"] = 7.2;

        params["vote_count.gte"] = 20;
        params["vote_count.lte"] = 1500;

        params["primary_release_date.gte"] = "1980-01-01";
        params["primary_release_date.lte"] = "2016-01-01";

        params["first_air_date.gte"] = "1980-01-01";
        params["first_air_date.lte"] = "2016-01-01";

        params.sort_by = "vote_average.desc";

        break;

      case "anime":
        endpoints = ["/discover/tv"];
        params.with_genres = 16;
        params.with_original_language = "ja";
        break;

      case "franchise":
        params.sort_by = "popularity.desc";
        params["vote_count.gte"] = 500;
        break;

      default:
        return res.status(400).json({
          message: "Invalid category",
        });
    }

    const results = await Promise.allSettled(
      endpoints.map((ep) => fetchFromTMDB(ep, params)),
    );

    let merged = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value.results);

    merged = merged.map((item) => ({
      ...item,
      media_type: item.first_air_date ? "tv" : "movie",
    }));

    res.json({
      results: merged,
      page: Number(page),
    });
  } catch (error) {
    console.error(
      "Explore Categories Error:",
      error.response?.data || error.message,
    );

    res.status(500).json({
      message: "Failed to fetch explore categories",
    });
  }
};

exports.searchMedia = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const data = await fetchFromTMDB("/search/multi", {
      query,
      page: 1,
    });

    const results = data.results
      .filter(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          (item.title || item.name),
      )
      .slice(0, 10);

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Search failed",
    });
  }
};

const MediaReview = require("../models/Media_Reviews");

const RATING_COLORS = {
  Perfection: "#a855f7",
  "Go for it": "#00d284",
  TimePass: "#ffb703",
  "Skip it": "#ff6384",
};

const normalizeSectionItems = (items, fallbackType = "movie", ratingMap = {}) => {
  return (items || [])
    .filter((item) => item && (item.title || item.name) && item.poster_path)
    .map((item) => {
      const mediaIdStr = item.id?.toString();
      const ratingInfo = ratingMap[mediaIdStr] || null;

      return {
        ...item,
        media_type:
          item.media_type ||
          (item.first_air_date ? "tv" : item.release_date ? "movie" : fallbackType),
        watchhub_rating: ratingInfo,
      };
    });
};

exports.getHomeSections = async (req, res) => {
  try {
    const { type = "all" } = req.query;
    const cacheKey = `home_sections_${type}`;
    const now = Date.now();

    if (memCache[cacheKey] && memCache[cacheKey].expiry > now) {
      return res.json(memCache[cacheKey].data);
    }

    // 1. Trending Now
    const trendingEp =
      type === "movie"
        ? "/trending/movie/day"
        : type === "tv"
        ? "/trending/tv/day"
        : type === "anime"
        ? "/discover/tv"
        : "/trending/all/day";
    const trendingParams =
      type === "anime"
        ? { with_genres: 16, with_original_language: "ja", sort_by: "popularity.desc" }
        : {};

    // 2. Top Rated
    const topRatedEp =
      type === "movie"
        ? "/movie/top_rated"
        : type === "tv"
        ? "/tv/top_rated"
        : type === "anime"
        ? "/discover/tv"
        : "/movie/top_rated";
    const topRatedParams =
      type === "anime"
        ? {
            with_genres: 16,
            with_original_language: "ja",
            sort_by: "vote_average.desc",
            "vote_count.gte": 200,
          }
        : {};

    // 3. Popular This Week
    const popWeekEp =
      type === "movie"
        ? "/trending/movie/week"
        : type === "tv"
        ? "/trending/tv/week"
        : type === "anime"
        ? "/discover/tv"
        : "/trending/all/week";
    const popWeekParams =
      type === "anime"
        ? {
            with_genres: 16,
            with_original_language: "ja",
            sort_by: "popularity.desc",
            page: 2,
          }
        : {};

    // 4. Upcoming
    const upcomingEp =
      type === "tv"
        ? "/discover/tv"
        : type === "anime"
        ? "/discover/tv"
        : "/movie/upcoming";
    const upcomingParams =
      type === "tv"
        ? { "first_air_date.gte": "2025-01-01", sort_by: "popularity.desc" }
        : type === "anime"
        ? {
            with_genres: 16,
            with_original_language: "ja",
            "first_air_date.gte": "2024-01-01",
            sort_by: "popularity.desc",
          }
        : {};

    // 5. Hidden Gems
    const gemEp =
      type === "tv" || type === "anime" ? "/discover/tv" : "/discover/movie";
    const gemParams =
      type === "anime"
        ? {
            with_genres: 16,
            with_original_language: "ja",
            "vote_average.gte": 7.6,
            "vote_count.gte": 30,
            "vote_count.lte": 2000,
            sort_by: "vote_average.desc",
          }
        : {
            "vote_average.gte": 7.4,
            "vote_count.gte": 40,
            "vote_count.lte": 2000,
            sort_by: "vote_average.desc",
          };

    // 6. Don't Miss These on Netflix
    const netflixEp = type === "movie" ? "/discover/movie" : "/discover/tv";
    const netflixParams = {
      with_watch_providers: "8",
      watch_region: "IN",
      sort_by: "popularity.desc",
      ...(type === "anime"
        ? { with_genres: 16, with_original_language: "ja" }
        : {}),
    };

    // 7. Don't Miss These on JioHotstar
    const hotstarEp = type === "movie" ? "/discover/movie" : "/discover/tv";
    const hotstarParams = {
      with_watch_providers: "122|232|337",
      watch_region: "IN",
      sort_by: "popularity.desc",
      ...(type === "anime" ? { with_genres: 16 } : {}),
    };

    // 8. Don't Miss These on Prime
    const primeEp = type === "movie" ? "/discover/movie" : "/discover/tv";
    const primeParams = {
      with_watch_providers: "119|9",
      watch_region: "IN",
      sort_by: "popularity.desc",
      ...(type === "anime" ? { with_genres: 16 } : {}),
    };

    // 9. Don't Miss These on Crunchyroll
    const crEp = type === "movie" ? "/discover/movie" : "/discover/tv";
    const crParams =
      type === "movie"
        ? {
            with_genres: 16,
            with_original_language: "ja",
            sort_by: "popularity.desc",
          }
        : type === "anime"
        ? {
            with_genres: 16,
            with_original_language: "ja",
            sort_by: "popularity.desc",
            page: 3,
          }
        : {
            with_watch_providers: "283",
            watch_region: "IN",
            sort_by: "popularity.desc",
          };

    const [
      tRes,
      trRes,
      pwRes,
      uRes,
      hgRes,
      nRes,
      jhRes,
      pRes,
      cRes,
    ] = await Promise.allSettled([
      fetchFromTMDB(trendingEp, trendingParams),
      fetchFromTMDB(topRatedEp, topRatedParams),
      fetchFromTMDB(popWeekEp, popWeekParams),
      fetchFromTMDB(upcomingEp, upcomingParams),
      fetchFromTMDB(gemEp, gemParams),
      fetchFromTMDB(netflixEp, netflixParams),
      fetchFromTMDB(hotstarEp, hotstarParams),
      fetchFromTMDB(primeEp, primeParams),
      fetchFromTMDB(crEp, crParams),
    ]);

    const allRawItems = [
      ...(tRes.status === "fulfilled" ? tRes.value.results || [] : []),
      ...(trRes.status === "fulfilled" ? trRes.value.results || [] : []),
      ...(pwRes.status === "fulfilled" ? pwRes.value.results || [] : []),
      ...(uRes.status === "fulfilled" ? uRes.value.results || [] : []),
      ...(hgRes.status === "fulfilled" ? hgRes.value.results || [] : []),
      ...(nRes.status === "fulfilled" ? nRes.value.results || [] : []),
      ...(jhRes.status === "fulfilled" ? jhRes.value.results || [] : []),
      ...(pRes.status === "fulfilled" ? pRes.value.results || [] : []),
      ...(cRes.status === "fulfilled" ? cRes.value.results || [] : []),
    ];

    const allMediaIds = Array.from(
      new Set(allRawItems.map((item) => item.id?.toString()).filter(Boolean))
    );

    const ratingMap = {};
    if (allMediaIds.length > 0) {
      try {
        const aggregation = await MediaReview.aggregate([
          { $match: { MediaID: { $in: allMediaIds } } },
          {
            $group: {
              _id: { mediaId: "$MediaID", rating: "$rating" },
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: "$_id.mediaId",
              ratings: {
                $push: {
                  rating: "$_id.rating",
                  count: "$count",
                },
              },
              total: { $sum: "$count" },
            },
          },
        ]);

        if (aggregation && aggregation.length > 0) {
          aggregation.forEach((item) => {
            const total = item.total || 0;
            if (total > 0) {
              const perfectionItem = item.ratings?.find(
                (r) => r.rating === "Perfection"
              );
              const perfectionPercent = perfectionItem
                ? Math.round((perfectionItem.count / total) * 100)
                : 0;

              const highest = item.ratings?.reduce(
                (max, curr) => (curr.count > max.count ? curr : max),
                item.ratings[0]
              );
              const dominantRating = highest ? highest.rating : "Perfection";
              const dominantPercent = highest
                ? Math.round((highest.count / total) * 100)
                : perfectionPercent;

              ratingMap[item._id] = {
                total,
                perfection: perfectionPercent,
                dominantRating,
                dominantPercent,
                color: RATING_COLORS[dominantRating] || "#a855f7",
              };
            }
          });
        }
      } catch (err) {
        console.error("Error aggregating reviews:", err.message);
      }
    }

    const fallbackType = type === "anime" ? "tv" : type;

    const sections = {
      trending: normalizeSectionItems(
        tRes.status === "fulfilled" ? tRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      topRated: normalizeSectionItems(
        trRes.status === "fulfilled" ? trRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      popularThisWeek: normalizeSectionItems(
        pwRes.status === "fulfilled" ? pwRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      upcoming: normalizeSectionItems(
        uRes.status === "fulfilled" ? uRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      hiddenGems: normalizeSectionItems(
        hgRes.status === "fulfilled" ? hgRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      netflix: normalizeSectionItems(
        nRes.status === "fulfilled" ? nRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      jiohotstar: normalizeSectionItems(
        jhRes.status === "fulfilled" ? jhRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      prime: normalizeSectionItems(
        pRes.status === "fulfilled" ? pRes.value.results : [],
        fallbackType,
        ratingMap
      ),
      crunchyroll: normalizeSectionItems(
        cRes.status === "fulfilled" ? cRes.value.results : [],
        "tv",
        ratingMap
      ),
    };

    memCache[cacheKey] = {
      data: sections,
      expiry: now + 5 * 60 * 1000, // 5 minutes cache
    };

    res.json(sections);
  } catch (error) {
    console.error("Home sections error:", error.message);
    res.status(500).json({ message: "Failed to fetch home sections" });
  }
};

