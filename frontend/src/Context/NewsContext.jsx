import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [news, setNews] = useState([]);
  const [newsDetails, setNewsDetails] = useState(null);
  const [page, setPage] = useState(1);
  const [reactions, setReactions] = useState([]);

  const fetchNews = async ({
    contentType = "all",
    search = "",
    page = 1,
  } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await API.get("/news", {
        params: {
          contentType,
          search,
          page,
        },
      });
      setNews(data.articles);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsDetails = async (articleUrl) => {
    try {
      setLoading(true);
      setError(null);
      setNewsDetails(null);
      const res = await API.get(`/news/${encodeURIComponent(articleUrl)}`);

      setNewsDetails(res.data.article);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const getNewsReactions = async (articleUrl) => {
    try {
      const res = await API.get(
        `/news/${encodeURIComponent(articleUrl)}/reactions`,
      );
      setReactions(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching news reactions:", error);
      throw error;
    }
  };

  const toggleReaction = async (newsId, reactionType) => {
    try {
      const res = await API.post("/news/toggle-reaction", {
        newsId,
        reactionType,
      });

      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NewsContext.Provider
      value={{
        loading,
        error,
        news,
        page,
        setPage,
        fetchNews,
        newsDetails,
        fetchNewsDetails,
        getNewsReactions,
        toggleReaction,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
