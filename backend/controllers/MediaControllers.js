const { fetchFromTMDB } = require("../ultils/tmdbService");

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
