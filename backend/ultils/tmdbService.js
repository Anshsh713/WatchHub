const axios = require("axios");

const URL = "https://api.themoviedb.org/3";

exports.fetchFromTMDB = async (endpoint, params = {}) => {
  const res = await axios.get(`${URL}${endpoint}`, {
    params: {
      api_key: process.env.Movies,
      ...params,
    },
  });

  return res.data;
};
