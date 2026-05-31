const axios = require("axios");

const NEWS_URL = "https://newsapi.org/v2";

exports.fetchNews = async (params = {}) => {
  try {
    const res = await axios.get(`${NEWS_URL}/everything`, {
      params: {
        apiKey: process.env.NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
        ...params,
      },
    });

    return res.data;
  } catch (error) {
    console.error("NewsAPI Error:", error.response?.data);
    throw error;
  }
};
