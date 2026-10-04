import React, { createContext, useContext, useState, useCallback } from "react";
import API from "../Services/Axios_api";

const ClubContext = createContext();

export const ClubProvider = ({ children }) => {
  const [clubs, setClubs] = useState([]);
  const [totalClubs, setTotalClubs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentClub, setCurrentClub] = useState(null);
  const [clubPosts, setClubPosts] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Clubs (explore / filter)
  const fetchClubs = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/clubs", { params });
      setClubs(res.data.clubs || []);
      setTotalClubs(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.page || 1);
      return res.data;
    } catch (err) {
      console.error("Fetch clubs error:", err);
      setError(err.response?.data?.message || "Failed to load clubs");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Single Club Details
  const fetchClubDetails = useCallback(async (slugOrId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/clubs/${slugOrId}`);
      setCurrentClub(res.data.club);
      return res.data;
    } catch (err) {
      console.error("Fetch club details error:", err);
      setError(err.response?.data?.message || "Failed to load club details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Create Club
  const createClub = async (clubData) => {
    try {
      const res = await API.post("/clubs", clubData);
      setClubs((prev) => [res.data.club, ...prev]);
      return res.data.club;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create club");
    }
  };

  // 4. Update Club
  const updateClub = async (id, data) => {
    try {
      const res = await API.put(`/clubs/${id}`, data);
      setCurrentClub((prev) => (prev ? { ...prev, ...res.data.club } : res.data.club));
      setClubs((prev) => prev.map((c) => (c._id === id ? res.data.club : c)));
      return res.data.club;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update club");
    }
  };

  // 5. Join Club
  const joinClub = async (id) => {
    try {
      const res = await API.post(`/clubs/${id}/join`);
      setClubs((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, isMember: true, membersCount: res.data.membersCount }
            : c
        )
      );
      if (currentClub && currentClub._id === id) {
        setCurrentClub((prev) => ({
          ...prev,
          isMember: true,
          membersCount: res.data.membersCount,
        }));
      }
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to join club");
    }
  };

  // 6. Leave Club
  const leaveClub = async (id) => {
    try {
      const res = await API.post(`/clubs/${id}/leave`);
      setClubs((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, isMember: false, membersCount: res.data.membersCount }
            : c
        )
      );
      if (currentClub && currentClub._id === id) {
        setCurrentClub((prev) => ({
          ...prev,
          isMember: false,
          membersCount: res.data.membersCount,
        }));
      }
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to leave club");
    }
  };

  // 7. Fetch Club Posts
  const fetchClubPosts = useCallback(async (clubId) => {
    try {
      setLoadingPosts(true);
      const res = await API.get(`/clubs/${clubId}/posts`);
      setClubPosts(res.data.posts || []);
      return res.data.posts;
    } catch (err) {
      console.error("Fetch posts error:", err);
      return [];
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // 8. Create Club Post
  const createClubPost = async (clubId, postData) => {
    try {
      const res = await API.post(`/clubs/${clubId}/posts`, postData);
      setClubPosts((prev) => [res.data.post, ...prev]);
      if (currentClub && currentClub._id === clubId) {
        setCurrentClub((prev) => ({
          ...prev,
          postsCount: (prev.postsCount || 0) + 1,
        }));
      }
      return res.data.post;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create post");
    }
  };

  // 9. Delete Club Post
  const deleteClubPost = async (postId) => {
    try {
      await API.delete(`/clubs/posts/${postId}`);
      setClubPosts((prev) => prev.filter((p) => p._id !== postId));
      if (currentClub) {
        setCurrentClub((prev) => ({
          ...prev,
          postsCount: Math.max(0, (prev.postsCount || 1) - 1),
        }));
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete post");
    }
  };

  // 10. Toggle Like Post
  const toggleLikePost = async (postId) => {
    try {
      const res = await API.post(`/clubs/posts/${postId}/like`);
      setClubPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                hasLiked: res.data.hasLiked,
                likesCount: res.data.likesCount,
              }
            : p
        )
      );
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to like post");
    }
  };

  // 11. Add Post Comment
  const addPostComment = async (postId, content) => {
    try {
      const res = await API.post(`/clubs/posts/${postId}/comment`, { content });
      setClubPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), res.data.comment],
                commentsCount: res.data.commentsCount,
              }
            : p
        )
      );
      return res.data.comment;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to add comment");
    }
  };

  // 12. Fetch Club Members
  const fetchClubMembers = useCallback(async (clubId) => {
    try {
      const res = await API.get(`/clubs/${clubId}/members`);
      setClubMembers(res.data.members || []);
      return res.data.members;
    } catch (err) {
      console.error("Fetch members error:", err);
      return [];
    }
  }, []);

  // 13. Fetch User's Joined Clubs
  const fetchUserClubs = useCallback(async (identifier) => {
    try {
      const res = await API.get(`/clubs/user/${identifier}`);
      setUserClubs(res.data.clubs || []);
      return res.data.clubs;
    } catch (err) {
      console.error("Fetch user clubs error:", err);
      return [];
    }
  }, []);

  return (
    <ClubContext.Provider
      value={{
        clubs,
        totalClubs,
        totalPages,
        currentPage,
        currentClub,
        clubPosts,
        clubMembers,
        userClubs,
        loading,
        loadingPosts,
        error,
        fetchClubs,
        fetchClubDetails,
        createClub,
        updateClub,
        joinClub,
        leaveClub,
        fetchClubPosts,
        createClubPost,
        deleteClubPost,
        toggleLikePost,
        addPostComment,
        fetchClubMembers,
        fetchUserClubs,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClubs = () => useContext(ClubContext);
