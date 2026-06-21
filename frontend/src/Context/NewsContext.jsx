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
  const [savedNews, setSavedNews] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

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

  const toggleBookmark = async (article) => {
    try {
      const { data } = await API.post("/news/save", {
        NewsID: article.url,
        Title: article.title,
        Description: article.description,
        Image: article.image,
        Source: article.source,
        Url: article.url,
        PublishedAt: article.publishedAt,
        Category: article.category,
      });

      setIsSaved(data.saved);

      if (data.saved) {
        setSavedNews((prev) => [...prev, article]);
      } else {
        setSavedNews((prev) => prev.filter((item) => item.url !== article.url));
      }

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const checkBookmark = async (newsId) => {
    try {
      const { data } = await API.get(
        `/news/saved/${encodeURIComponent(newsId)}`,
      );

      setIsSaved(data.saved);

      return data.saved;
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSavedNews = async () => {
    try {
      const { data } = await API.get("/news/saved");

      setSavedNews(data);

      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const addView = async (NewsID) => {
    try {
      await API.post(
        "/news/view",
        { NewsID },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
    } catch (error) {
      console.error("Error adding view:", error);
    }
  };

  const getViews = async (NewsID) => {
    try {
      const res = await API.get(`/news/view/${encodeURIComponent(NewsID)}`);

      return res.data.views;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  return (
    <NewsContext.Provider
      value={{
        loading,
        error,
        news,
        newsDetails,
        page,
        setPage,
        fetchNews,
        fetchNewsDetails,
        getNewsReactions,
        toggleReaction,
        toggleBookmark,
        checkBookmark,
        fetchSavedNews,
        savedNews,
        isSaved,
        addView,
        getViews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
