const { fetchFromTMDB } = require("../ultils/tmdbService");

exports.getMedia = async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    let endpoint = "";

    if (type === "movie") {
      endpoint = "/discover/movie";
    } else if (type === "tv") {
      endpoint = "/discover/tv";
    } else if (type === "anime") {
      endpoint = "/discover/tv";
    } else if (type === "all") {
      endpoint = "/trending/all/week";
    } else {
      return res.status(400).json({ message: "Invalid media type" });
    }

    const data = await fetchFromTMDB(endpoint, {
      page: page,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch media" });
  }
};
