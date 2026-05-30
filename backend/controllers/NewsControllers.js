const NewsAPI = require("../ultils/NEWSAPI");

exports.getNews = async (req, res) => {
  try {
    const { contentType = "all", search = "", page = 1 } = req.query;

    let query;

    if (search) {
      query = search;
    } else {
      switch (contentType) {
        case "movie":
          query = "(movie OR film OR cinema OR hollywood)";
          break;

        case "tv":
          query = "(tv OR television OR series OR streaming)";
          break;

        case "anime":
          query = "(anime OR manga OR crunchyroll)";
          break;

        default:
          query =
            "(movie OR film OR cinema OR tv OR television OR series OR anime OR manga)";
      }
    }

    const news = await NewsAPI.fetchNews({
      q: query,
      page,
    });

    res.status(200).json({
      success: true,
      totalResults: news.totalResults,
      articles: news.articles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
