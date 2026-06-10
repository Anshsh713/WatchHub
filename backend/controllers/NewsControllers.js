const NewsAPI = require("../ultils/NEWSAPI");
const NewsReaction = require("../models/News_Reaction");
const SavedNews = require("../models/News_Saved");

const EXCLUSION_QUERY =
  "NOT (politics OR election OR court OR lawsuit OR crime OR finance OR stock OR weather OR medical OR war OR accident OR death OR vaccine OR covid OR strike OR arrest OR protest OR legislative OR senate OR parliament OR congress)";

const ENTERTAINMENT_KEYWORDS = [
  "movie",
  "film",
  "cinema",
  "theater",
  "theatre",
  "hollywood",
  "bollywood",
  "actor",
  "actress",
  "director",
  "producer",
  "screenplay",
  "marvel",
  "dc",
  "disney",
  "netflix",
  "hbo",
  "paramount",
  "warner",
  "hulu",
  "peacock",
  "crunchyroll",
  "funimation",
  "sonypictures",
  "universalpictures",
  "show",
  "tv",
  "television",
  "series",
  "episode",
  "season",
  "premiere",
  "trailer",
  "sitcom",
  "casting",
  "anime",
  "manga",
  "otaku",
  "cosplay",
  "goku",
  "naruto",
  "one piece",
  "demon slayer",
  "attack on titan",
  "miyazaki",
  "ghibli",
  "shonen",
  "game",
  "gaming",
  "gamer",
  "playstation",
  "xbox",
  "nintendo",
  "switch",
  "steam",
  "sega",
  "console",
  "esports",
  "developer",
  "studio",
  "fps",
  "rpg",
  "multiplayer",
  "videogame",
  "videogames",
  "video-game",
  "spoiler",
  "review",
  "teaser",
  "cast",
  "box office",
  "blockbuster",
  "soundtrack",
  "entertainment",
  "mcu",
  "dceu",
  "comic-con",
  "oscars",
  "oscars2026",
  "emmy",
];

const getArticleCategory = (title = "", description = "") => {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Anime (Highly specific terms first)
  if (
    text.includes("anime") ||
    text.includes("manga") ||
    text.includes("crunchyroll") ||
    text.includes("funimation") ||
    text.includes("otaku") ||
    text.includes("cosplay") ||
    text.includes("goku") ||
    text.includes("naruto") ||
    text.includes("one piece") ||
    text.includes("demon slayer") ||
    text.includes("miyazaki") ||
    text.includes("ghibli") ||
    text.includes("shonen")
  ) {
    return "anime";
  }

  // 2. Games
  if (
    text.includes("gaming") ||
    text.includes("gameplay") ||
    text.includes("gamer") ||
    text.includes("playstation") ||
    text.includes("xbox") ||
    text.includes("nintendo") ||
    text.includes("switch") ||
    text.includes("steam") ||
    text.includes("console") ||
    text.includes("esports") ||
    text.includes("videogame") ||
    text.includes("video game") ||
    text.includes("pc game") ||
    text.includes("rpg") ||
    text.includes("multiplayer") ||
    text.includes("developer")
  ) {
    return "game";
  }

  // 3. TV Shows / Series
  if (
    text.includes("television") ||
    text.includes("series") ||
    text.includes("episode") ||
    text.includes("season") ||
    text.includes("tv show") ||
    text.includes("tv series") ||
    text.includes("sitcom") ||
    text.includes("hbo show") ||
    text.includes("netflix show") ||
    text.includes("disney+ series") ||
    text.includes("casting") ||
    text.includes("hulu series")
  ) {
    return "show";
  }

  // 4. Movies
  return "movie";
};

const getNormalizedCategory = (type = "") => {
  const t = type.toLowerCase();
  if (t === "movie" || t === "movies") return "movie";
  if (t === "show" || t === "shows" || t === "tv") return "show";
  if (t === "anime") return "anime";
  if (t === "game" || t === "games") return "game";
  return "all";
};

const isEntertainmentRelated = (article) => {
  const title = (article.title || "").toLowerCase();
  const description = (
    article.description ||
    article.content ||
    ""
  ).toLowerCase();
  const source = (article.source?.name || "").toLowerCase();
  const combinedText = `${title} ${description} ${source}`;

  return ENTERTAINMENT_KEYWORDS.some((keyword) =>
    combinedText.includes(keyword),
  );
};

exports.getNews = async (req, res) => {
  try {
    const { contentType = "all", search = "", page = 1 } = req.query;
    const targetCat = getNormalizedCategory(contentType);

    let query;

    if (search) {
      if (targetCat !== "all") {
        let categoryQuery = "";
        if (targetCat === "movie") {
          categoryQuery = "movie OR film OR cinema OR Marvel OR DC";
        } else if (targetCat === "show") {
          categoryQuery = "television OR series OR Netflix OR HBO OR show";
        } else if (targetCat === "anime") {
          categoryQuery = "anime OR manga OR Crunchyroll";
        } else if (targetCat === "game") {
          categoryQuery =
            "gaming OR PlayStation OR Xbox OR Nintendo OR game OR videogame OR videogames OR video-game";
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
      const MOVIE_QUERY =
        'movie OR film OR cinema OR hollywood OR blockbuster OR "box office"';
      const SHOW_QUERY =
        'television OR series OR tv OR sitcom OR episode OR "season premiere"';
      const ANIME_QUERY = "anime OR manga OR Crunchyroll OR Naruto OR Ghibli";
      const GAME_QUERY =
        'gaming OR playstation OR xbox OR nintendo OR videogame OR video-game OR "steam deck"';

      switch (targetCat) {
        case "movie":
          query = MOVIE_QUERY;
          break;

        case "show":
          query = SHOW_QUERY;
          break;

        case "anime":
          query = ANIME_QUERY;
          break;

        case "game":
          query = GAME_QUERY;
          break;

        default:
          query =
            "Marvel OR DC OR Disney OR movie OR film OR Netflix OR HBO OR television OR series OR anime OR manga OR Crunchyroll OR Naruto OR One Piece OR gaming OR PlayStation OR Xbox OR Nintendo";
      }
    }

    const finalQuery = `(${query}) ${EXCLUSION_QUERY}`;

    // If requesting a specific category, fetch a larger batch of articles to ensure we can fulfill standard page sizes after strict JS category filtering
    const fetchSize = targetCat === "all" ? 40 : 60;

    const news = await NewsAPI.fetchNews({
      q: finalQuery,
      pageSize: fetchSize,
      page,
    });

    const articles = news.articles
      .filter((article) => {
        if (!article.title || article.title === "[Removed]") return false;
        if (!isEntertainmentRelated(article)) return false;

        // Strict Category Validation
        if (targetCat !== "all") {
          const articleCat = getArticleCategory(
            article.title,
            article.description,
          );
          if (articleCat !== targetCat) return false;
        }
        return true;
      })
      .slice(0, 20) // Cap at standard page size of 20
      .map((article, index) => {
        const cat = getArticleCategory(article.title, article.description);
        return {
          id: `${page}-${index}`,
          title: article.title,
          description:
            article.description ||
            article.content ||
            "No description available",
          image:
            article.urlToImage ||
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop",
          source: article.source?.name || "Unknown Source",
          author: article.author || "Unknown Author",
          url: article.url,
          publishedAt: article.publishedAt,
          category: cat, // Return verified classified category
          impact: getImpact(article.title),
        };
      });

    const articleUrls = articles.map((a) => a.url);
    const reactions = await NewsReaction.find({ NewsID: { $in: articleUrls } });

    const reactionMap = {};
    reactions.forEach((r) => {
      if (!reactionMap[r.NewsID]) {
        reactionMap[r.NewsID] = { like: 0, hype: 0, shocked: 0, sad: 0 };
      }
      reactionMap[r.NewsID][r.ReactionType]++;
    });

    const emojiMap = {
      like: "👍",
      hype: "🔥",
      shocked: "😲",
      sad: "😢",
    };

    articles.forEach((article) => {
      const counts = reactionMap[article.url];
      if (!counts) {
        article.mostReactedEmoji = null;
        return;
      }
      let maxCount = 0;
      let maxType = null;
      Object.keys(counts).forEach((type) => {
        if (counts[type] > maxCount) {
          maxCount = counts[type];
          maxType = type;
        }
      });
      article.mostReactedEmoji = maxType ? emojiMap[maxType] : null;
    });

    res.status(200).json({
      success: true,
      page: Number(page),
      totalResults: articles.length,
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

exports.getNewsDetails = async (req, res) => {
  try {
    const { articleUrl } = req.params;
    if (!articleUrl) {
      return res.status(400).json({
        success: false,
        message: "Article URL is required",
      });
    }
    console.log("1");
    console.log("PARAM:", req.params.articleUrl);
    console.log("DECODED:", decodeURIComponent(req.params.articleUrl));

    const decodedUrl = decodeURIComponent(articleUrl);

    const news = await NewsAPI.fetchNews({
      q: "movie OR film OR television OR anime OR gaming",
      pageSize: 100,
    });
    console.log("2");
    console.log("PARAM:", req.params.articleUrl);
    console.log("DECODED:", decodeURIComponent(req.params.articleUrl));

    const article = news.articles.find((item) => item.url === decodedUrl);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }
    console.log("3");
    console.log("PARAM:", req.params.articleUrl);
    console.log("DECODED:", decodeURIComponent(req.params.articleUrl));

    const impact = getImpact(article.title);

    res.status(200).json({
      success: true,
      article: {
        title: article.title,
        description: article.description,
        content: article.content,
        image: article.urlToImage || "https://via.placeholder.com/1200x600",

        source: article.source?.name,
        author: article.author,
        url: article.url,
        publishedAt: article.publishedAt,

        impact,
      },
    });
  } catch (error) {
    console.error("NEWS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching news details",
    });
  }
};

function getImpact(title = "") {
  const lower = title.toLowerCase();

  if (
    lower.includes("cancelled") ||
    lower.includes("shutdown") ||
    lower.includes("acquired")
  ) {
    return "Breaking";
  }

  if (
    lower.includes("announced") ||
    lower.includes("confirmed") ||
    lower.includes("official")
  ) {
    return "Major";
  }

  if (
    lower.includes("trailer") ||
    lower.includes("teaser") ||
    lower.includes("first look")
  ) {
    return "Medium";
  }

  return "Minor";
}

exports.ToggleNewsReaction = async (req, res) => {
  try {
    const { newsId, reactionType } = req.body;
    const userId = req.user?._id;

    if (!newsId || !reactionType) {
      return res
        .status(400)
        .json({ message: "newsId and reactionType are required" });
    }

    const existingReaction = await NewsReaction.findOne({
      NewsID: newsId,
      User: userId,
    });

    // Same reaction clicked again
    if (existingReaction && existingReaction.ReactionType === reactionType) {
      await existingReaction.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Reaction removed",
      });
    }

    // User changes reaction
    if (existingReaction) {
      existingReaction.ReactionType = reactionType;

      await existingReaction.save();

      return res.status(200).json({
        success: true,
        message: "Reaction updated",
      });
    }

    // First reaction
    await NewsReaction.create({
      NewsID: newsId,
      User: userId,
      ReactionType: reactionType,
    });

    res.status(201).json({
      success: true,
      message: "Reaction added",
    });
  } catch (error) {
    console.error("ToggleNewsReaction error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getNewsReactions = async (req, res) => {
  try {
    const { newsId } = req.params;

    if (!newsId) {
      return res.status(400).json({ message: "newsId is required" });
    }

    const reactions = await NewsReaction.find({ NewsID: newsId });

    const result = {
      like: 0,
      hype: 0,
      shocked: 0,
      sad: 0,
      userReaction: null,
    };

    reactions.forEach((reaction) => {
      result[reaction.ReactionType]++;

      const userId = req.user?._id;

      if (userId && reaction.User.toString() === userId.toString()) {
        result.userReaction = reaction.ReactionType;
      }
    });

    res.status(200).json({
      success: true,
      reactions: result,
    });
  } catch (error) {
    console.error("getNewsReactions error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }

    const news = await NewsAPI.fetchNews({
      q: "movie OR film OR television OR anime OR gaming",
      pageSize: 100,
    });

    const articles = news.articles.map((article, index) => ({
      id: `1-${index}`,
      title: article.title,
      description: article.description,
      image: article.urlToImage,
      source: article.source?.name,
      author: article.author,
      url: article.url,
      publishedAt: article.publishedAt,
    }));

    const foundArticle = articles.find((item) => item.id === articleId);

    if (!foundArticle) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.status(200).json({
      success: true,
      article: foundArticle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching news details",
    });
  }
};

exports.ToggleSaveNews = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(req.body);
    console.log(req.user);
    const {
      NewsID,
      Title,
      Description,
      Image,
      Source,
      Url,
      PublishedAt,
      Category,
    } = req.body;

    const existing = await SavedNews.findOne({
      User: userId,
      NewsID,
    });

    if (existing) {
      await existing.deleteOne();

      return res.json({
        saved: false,
        message: "Removed from saved",
      });
    }

    await SavedNews.create({
      User: userId,
      NewsID,
      Title,
      Description,
      Image,
      Source,
      Url,
      PublishedAt,
      Category,
    });

    res.json({
      saved: true,
      message: "Saved successfully",
    });
  } catch (error) {
    console.error("SAVE ERROR:", error);

    res.status(500).json({
      message: error.message,
      error,
    });
  }
};

exports.GetSavedNews = async (req, res) => {
  try {
    console.log(req.params);
    const savedNews = await SavedNews.find({
      User: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.json(savedNews);
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.CheckSavedNews = async (req, res) => {
  try {
    const { NewsID } = req.params;

    const saved = await SavedNews.exists({
      User: req.user._id,
      NewsID,
    });

    res.json({
      saved: !!saved,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
