import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const MediaReviewsContext = createContext();

export const MediaReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = async (mediaId, page = 1) => {
    try {
      setLoading(true);
      const res = await API.get(`/reviews/${mediaId}?page=${page}`);
      if (page === 1) {
        setReviews(res.data.reviews);
      } else {
        setReviews((prev) => [...prev, ...res.data.reviews]);
      }
    } catch (error) {
      setError(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (mediaId) => {
    try {
      const res = await API.get(`/reviews/stats/${mediaId}`);
      setStats(res.data);
    } catch (error) {
      setError(error);
    }
  };

  const CreateReview = async (data) => {
    try {
      const res = await API.post("/reviews/create", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setReviews((prev) => [res.data.review, ...prev]);

      return res.data;
    } catch (error) {
      console.error(
        "Create Review Error:",
        error.response?.data || error.message,
      );
    }
  };

  const toggleLike = async (reviewId) => {
    try {
      const res = await API.put(
        `/reviews/like/${reviewId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId
            ? { ...review, likes: Array(res.data.likesCount).fill("x") }
            : review,
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MediaReviewsContext.Provider
      value={{
        reviews,
        stats,
        loading,
        error,
        fetchReviews,
        fetchStats,
        CreateReview,
        toggleLike,
      }}
    >
      {children}
    </MediaReviewsContext.Provider>
  );
};

export const useMediaReviews = () => useContext(MediaReviewsContext);
