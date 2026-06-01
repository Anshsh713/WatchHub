import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [news, setNews] = useState([]);
  const [newsDetails, setNewsDetails] = useState(null);
  const [page, setPage] = useState(1);

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
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
