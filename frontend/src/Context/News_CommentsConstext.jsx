import React, { createContext, useContext, useState } from "react";
import API from "../Services/Axios_api";

const NewsCommentsContext = createContext();

export const NewsCommentsProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [repliesMap, setRepliesMap] = useState({});

  /* ─── Fetch comments for a news article ─── */
  const fetchComments = async (
    newsId,
    page = 1,
    sort = "mostLiked",
    filter = "all",
  ) => {
    try {
      setLoading(true);
      const res = await API.get(
        `/comments/${encodeURIComponent(newsId)}?page=${page}&sort=${sort}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (page === 1) {
        setComments(res.data.comments);
      } else {
        setComments((prev) => [...prev, ...res.data.comments]);
      }
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Create / update a comment ─── */
  const createComment = async (newsId, comment) => {
    try {
      setCreating(true);
      const res = await API.post(
        "/comments/create",
        { NewsID: newsId, comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (res.data.isUpdate) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === res.data.comment._id ? res.data.comment : c,
          ),
        );
      } else {
        setComments((prev) => [res.data.comment, ...prev]);
      }

      return res.data;
    } catch (err) {
      console.error("Create Comment Error:", err.response?.data || err.message);
    } finally {
      setCreating(false);
    }
  };

  /* ─── Toggle like on a comment ─── */
  const toggleLike = async (commentId) => {
    try {
      const res = await API.put(
        `/comments/like/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, likesCount: res.data.likesCount, isLiked: res.data.isLiked }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── Delete own comment ─── */
  const deleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Delete Comment Error:", err);
    }
  };

  /* ─── Add a reply to a comment ─── */
  const addReply = async (commentId, comment, replyingTo = null) => {
    try {
      const res = await API.post(
        `/comments/reply/${commentId}`,
        { comment, replyingTo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: res.data.replies,
      }));

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, repliesCount: (c.repliesCount || 0) + 1 }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── Toggle like on a reply ─── */
  const toggleLikeReply = async (commentId, replyId) => {
    try {
      const res = await API.put(
        `/comments/like-reply/${commentId}/${replyId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: prev[commentId]?.map((r) =>
          r._id === replyId
            ? { ...r, likesCount: res.data.likesCount, isLiked: res.data.isLiked }
            : r,
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── Fetch replies for a comment ─── */
  const fetchReplies = async (commentId) => {
    try {
      const res = await API.get(`/comments/replies/${commentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setRepliesMap((prev) => ({
        ...prev,
        [commentId]: res.data.replies,
      }));
    } catch (err) {
      console.error("Fetch replies error:", err.response?.data || err.message);
    }
  };

  return (
    <NewsCommentsContext.Provider
      value={{
        comments,
        loading,
        creating,
        error,
        totalPages,
        currentPage,
        repliesMap,
        fetchComments,
        createComment,
        toggleLike,
        deleteComment,
        addReply,
        toggleLikeReply,
        fetchReplies,
      }}
    >
      {children}
    </NewsCommentsContext.Provider>
  );
};

export const useNewsComments = () => useContext(NewsCommentsContext);
