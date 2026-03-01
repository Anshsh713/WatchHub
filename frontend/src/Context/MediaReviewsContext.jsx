import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const MediaReviewsContext = createContext();

export const MediaReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReviews = async (
    mediaId,
    page = 1,
    sort = "mostLiked",
    filter = "all",
  ) => {
    try {
      setLoading(true);
      if (page === 1) {
        setCurrentPage(1);
        setReviews([]);
        setTotalPages(1);
      }
      const res = await API.get(
        `/reviews/${mediaId}?page=${page}&sort=${sort}&filter=${filter}`,
      );
      if (page === 1) {
        setReviews(res.data.reviews);
      } else {
        setReviews((prev) => [...prev, ...res.data.reviews]);
      }
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (error) {
      setError(error);
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
      setCreating(true);
      const res = await API.post("/reviews/create", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.isUpdate) {
        setReviews((prev) =>
          prev.map((review) =>
            review._id === res.data.review._id ? res.data.review : review,
          ),
        );
      } else {
        setReviews((prev) => [res.data.review, ...prev]);
      }

      return res.data;
    } catch (error) {
      console.error(
        "Create Review Error:",
        error.response?.data || error.message,
      );
    } finally {
      setCreating(false);
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
            ? {
                ...review,
                likesCount: res.data.likesCount,
                isLiked: res.data.isLiked,
              }
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
        totalPages,
        currentPage,
        reviews,
        stats,
        loading,
        creating,
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
