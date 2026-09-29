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
  const [repliesMap, setRepliesMap] = useState({});
  const [repliesPagination, setRepliesPagination] = useState({});

  const fetchReviews = async (
    mediaId,
    page = 1,
    sort = "mostLiked",
    filter = "all",
  ) => {
    try {
      setLoading(true);
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

  // =========================
  // ADD REPLY — fixed
  // Now appends the single reply the server sends back, instead of
  // replacing the whole repliesMap[reviewId] array. This is what
  // stopped both main replies and sub-replies from stomping on
  // each other / getting wiped whenever a new reply was posted.
  // =========================
  const addReply = async (reviewId, comment, replyingTo = null) => {
    try {
      const res = await API.post(
        `/reviews/reply/${reviewId}`,
        { comment, replyingTo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const newReply = res.data.reply;

      setRepliesMap((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), newReply],
      }));

      setRepliesPagination((prev) => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          totalReplies: res.data.totalReplies,
        },
      }));

      setReviews((prev) =>
        prev.map((review) =>
          review._id === reviewId
            ? { ...review, repliesCount: (review.repliesCount || 0) + 1 }
            : review,
        ),
      );

      return newReply;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleLikeReply = async (reviewId, replyId) => {
    try {
      const res = await API.put(
        `/reviews/like-reply/${reviewId}/${replyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRepliesMap((prev) => ({
        ...prev,
        [reviewId]: prev[reviewId]?.map((reply) =>
          reply._id === replyId
            ? {
                ...reply,
                likesCount: res.data.likesCount,
                isLiked: res.data.isLiked,
              }
            : reply,
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReplies = async (reviewId, page = 1) => {
    try {
      const res = await API.get(`/reviews/replies/${reviewId}?page=${page}`);

      const newReplies = res.data.replies || [];
      const pagination = res.data.pagination;

      setRepliesMap((prev) => ({
        ...prev,
        [reviewId]:
          page === 1 ? newReplies : [...(prev[reviewId] || []), ...newReplies],
      }));

      setRepliesPagination((prev) => ({
        ...prev,
        [reviewId]: pagination,
      }));

      return res.data;
    } catch (error) {
      console.error(
        "Fetch replies error:",
        error.response?.data || error.message,
      );
      throw error;
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
        addReply,
        toggleLikeReply,
        fetchReplies,
        repliesMap,
        repliesPagination,
      }}
    >
      {children}
    </MediaReviewsContext.Provider>
  );
};

export const useMediaReviews = () => useContext(MediaReviewsContext);
