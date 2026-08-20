const axios = require("axios");

const BASE_URL = "https://api.tmdb.org/3";
const FALLBACK_URL = "https://api.themoviedb.org/3";

exports.fetchFromTMDB = async (endpoint, params = {}) => {
  const apiKey = process.env.Movies;
  try {
    const res = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        api_key: apiKey,
        ...params,
      },
      timeout: 10000,
    });
    return res.data;
  } catch (primaryErr) {
    // If primary endpoint fails, attempt fallback
    const res = await axios.get(`${FALLBACK_URL}${endpoint}`, {
      params: {
        api_key: apiKey,
        ...params,
      },
      timeout: 10000,
    });
    return res.data;
  }
};

