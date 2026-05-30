const axios = require("axios");

const NEWS_URL = "https://newsapi.org/v2";

exports.fetchNews = async (params = {}) => {
  try {
    const response = await axios.get(`${NEWS_URL}/everything`, {
      params: {
        apiKey: process.env.NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
        pageSize: 20,
        ...params,
      },
    });

    return response.data;
  } catch (error) {
    console.error("NewsAPI Error:", error.response?.data || error.message);

    throw new Error("Failed to fetch news");
  }
};
