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
