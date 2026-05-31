const NewsAPI = require("../ultils/NEWSAPI");

const EXCLUSION_QUERY = "NOT (politics OR election OR court OR lawsuit OR crime OR finance OR stock OR weather OR medical OR war OR accident OR death OR vaccine OR covid OR strike OR arrest OR protest OR legislative OR senate OR parliament OR congress)";

const ENTERTAINMENT_KEYWORDS = [
  "movie", "film", "cinema", "theater", "theatre", "hollywood", "bollywood", "actor", "actress", "director", "producer", "screenplay",
  "marvel", "dc", "disney", "netflix", "hbo", "paramount", "warner", "hulu", "peacock", "crunchyroll", "funimation", "sonypictures", "universalpictures",
  "show", "tv", "television", "series", "episode", "season", "premiere", "trailer", "sitcom", "casting",
  "anime", "manga", "otaku", "cosplay", "goku", "naruto", "one piece", "demon slayer", "attack on titan", "miyazaki", "ghibli", "shonen",
  "game", "gaming", "gamer", "playstation", "xbox", "nintendo", "switch", "steam", "sega", "console", "esports", "developer", "studio", "fps", "rpg", "multiplayer", "videogame", "videogames", "video-game",
  "spoiler", "review", "teaser", "cast", "box office", "blockbuster", "soundtrack", "entertainment", "mcu", "dceu", "comic-con", "oscars", "oscars2026", "emmy"
];

const isEntertainmentRelated = (article) => {
  const title = (article.title || "").toLowerCase();
  const description = (article.description || article.content || "").toLowerCase();
  const source = (article.source?.name || "").toLowerCase();
  const combinedText = `${title} ${description} ${source}`;

  return ENTERTAINMENT_KEYWORDS.some(keyword => combinedText.includes(keyword));
};

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
          categoryQuery = "gaming OR PlayStation OR Xbox OR Nintendo OR game OR videogame OR videogames OR video-game";
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

      const GAME_QUERY = "gaming OR PlayStation OR Xbox OR Nintendo OR videogame OR videogames OR video-game";

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

    // Append exclusion terms to enforce entertainment-only focus at the API query level
    const finalQuery = `(${query}) ${EXCLUSION_QUERY}`;

    const news = await NewsAPI.fetchNews({
      q: finalQuery,
      pageSize: 30, // Fetch slightly more to account for JS keyword filtering
      page,
    });

    const articles = news.articles
      .filter((article) => article.title && article.title !== "[Removed]" && isEntertainmentRelated(article))
      .slice(0, 20) // Cap at standard page size of 20
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
      totalResults: articles.length, // Sync totalResults to our filtered article count
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
