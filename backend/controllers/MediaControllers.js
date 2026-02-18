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

    let mediaType = type === "anime" ? "tv" : type;

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

    const director = credits.crew?.find((person) => person.job === "Director");

    let ageRating = null;

    if (releaseDates?.results) {
      const indiaRelease = releaseDates.results.find(
        (r) => r.iso_3166_1 === "IN",
      );
      ageRating = indiaRelease?.release_dates?.[0]?.certification || null;
    }

    const genres = details.genres || [];
    const vibeChart = genres.map((g) => ({
      name: g.name,
      percent: Math.floor(100 / genres.length),
    }));

    const releaseDate = details.release_date || details.first_air_date;

    const isInTheatre =
      releaseDate &&
      new Date(releaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    res.json({
      id: details.id,
      type: mediaType,
      name: details.title || details.name,
      overview: details.overview,

      images: {
        poster: details.poster_path,
        backdrop: details.backdrop_path,
      },

      trailer: trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : null,

      director: director?.name || null,

      country: details.production_countries,
      language: details.original_language,
      ageRating,

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
