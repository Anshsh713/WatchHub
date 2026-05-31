const NewsAPI = require("../ultils/NEWSAPI");

exports.getNews = async (req, res) => {
  try {
    const { contentType = "all", search = "", page = 1 } = req.query;

    let query;

    if (search) {
      if (contentType && contentType !== "all") {
        let categoryQuery = "";
        if (contentType === "movie" || contentType === "movies") {
          categoryQuery = "movie OR film OR cinema OR Marvel OR DC";
        } else if (contentType === "show" || contentType === "tv" || contentType === "shows") {
          categoryQuery = "television OR series OR Netflix OR HBO OR show";
        } else if (contentType === "anime") {
          categoryQuery = "anime OR manga OR Crunchyroll";
        } else if (contentType === "game" || contentType === "games") {
          categoryQuery = "gaming OR PlayStation OR Xbox OR Nintendo OR game";
        }
        
        if (categoryQuery) {
          query = `(${search}) AND (${categoryQuery})`;
        } else {
          query = search;
        }
      } else {
        query = search;
      }
    } else {
      const MOVIE_QUERY = "Marvel OR DC OR Disney OR movie OR film";

      const SHOW_QUERY = "Netflix OR HBO OR television OR series";

      const ANIME_QUERY =
        "anime OR manga OR Crunchyroll OR Naruto OR One Piece";

      const GAME_QUERY = "gaming OR PlayStation OR Xbox OR Nintendo";

      switch (contentType) {
        case "movie":
        case "movies":
          query = MOVIE_QUERY;
          break;

        case "show":
        case "shows":
        case "tv":
          query = SHOW_QUERY;
          break;

        case "anime":
          query = ANIME_QUERY;
          break;

        case "game":
        case "games":
          query = GAME_QUERY;
          break;

        default:
          query =
            "Marvel OR DC OR Disney OR movie OR film OR Netflix OR HBO OR television OR series OR anime OR manga OR Crunchyroll OR Naruto OR One Piece OR gaming OR PlayStation OR Xbox OR Nintendo";
      }
    }

    const news = await NewsAPI.fetchNews({
      q: query,
      pageSize: 20,
      page,
    });

    const articles = news.articles
      .filter((article) => article.title && article.title !== "[Removed]")
      .map((article, index) => ({
        id: `${page}-${index}`,
        title: article.title,
        description:
          article.description || article.content || "No description available",

        image: article.urlToImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop",

        source: article.source?.name || "Unknown Source",

        author: article.author || "Unknown Author",

        url: article.url,

        publishedAt: article.publishedAt,
      }));

    res.status(200).json({
      success: true,
      page: Number(page),
      totalResults: news.totalResults,
      articles,
    });
  } catch (error) {
    console.error("NEWS ERROR:", error);
    console.error("NEWS RESPONSE:", error.response?.data);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
