import React, { createContext, useContext, useState, useCallback } from "react";
import API from "../Services/Axios_api";

const FranchiseContext = createContext();

export const FranchiseProvider = ({ children }) => {
  const [franchises, setFranchises] = useState([]);
  const [myFollowing, setMyFollowing] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const [currentFranchise, setCurrentFranchise] = useState(null);
  const [franchiseContent, setFranchiseContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all franchises with optional sorting and sourceType filtering
  const fetchFranchises = useCallback(
    async (sort = "followers", sourceType = "") => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (sort) params.sort = sort;
        if (sourceType) params.sourceType = sourceType;

        const res = await API.get("/franchises", { params });
        setFranchises(res.data || []);
      } catch (err) {
        console.error("Failed to fetch franchises:", err);
        setError(err.response?.data?.message || "Failed to fetch franchises");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch franchises followed by current user
  const fetchMyFollowing = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMyFollowing([]);
      setFollowingIds([]);
      return;
    }
    try {
      const res = await API.get("/franchises/my/following");
      const list = res.data || [];
      setMyFollowing(list);
      setFollowingIds(list.map((item) => item._id || item.id));
    } catch (err) {
      console.error("Failed to fetch following franchises:", err);
    }
  }, []);

  // Fetch single franchise details by slug
  const fetchFranchiseDetails = useCallback(async (slug) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/franchises/${slug}`);
      setCurrentFranchise(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch franchise details:", err);
      setError(err.response?.data?.message || "Franchise not found");
      setCurrentFranchise(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFranchiseContent = useCallback(async (slug) => {
    try {
      setContentLoading(true);
      setError(null);

      const res = await API.get(`/franchises/${slug}/content`);

      const data = res.data || {};

      setFranchiseContent(data.results || []);

      return data;
    } catch (err) {
      console.error("Failed to fetch franchise content:", err);

      setError(err.response?.data?.message || "Failed to fetch content");

      setFranchiseContent([]);

      return {
        results: [],
        total: 0,
        movies: 0,
        tvShows: 0,
      };
    } finally {
      setContentLoading(false);
    }
  }, []);

  // Follow a franchise
  const followFranchise = async (franchiseId) => {
    try {
      await API.post(`/franchises/follow/${franchiseId}`);
      // Optimistic update
      setFollowingIds((prev) => [...prev, franchiseId]);
      setFranchises((prev) =>
        prev.map((f) =>
          f._id === franchiseId
            ? { ...f, followers: (f.followers || 0) + 1 }
            : f,
        ),
      );
      if (currentFranchise && currentFranchise._id === franchiseId) {
        setCurrentFranchise((prev) => ({
          ...prev,
          followers: (prev.followers || 0) + 1,
        }));
      }
      fetchMyFollowing();
    } catch (err) {
      console.error("Follow franchise failed:", err);
      throw new Error(
        err.response?.data?.message || "Failed to follow franchise",
      );
    }
  };

  // Unfollow a franchise
  const unfollowFranchise = async (franchiseId) => {
    try {
      await API.delete(`/franchises/follow/${franchiseId}`);
      // Optimistic update
      setFollowingIds((prev) => prev.filter((id) => id !== franchiseId));
      setFranchises((prev) =>
        prev.map((f) =>
          f._id === franchiseId
            ? { ...f, followers: Math.max(0, (f.followers || 0) - 1) }
            : f,
        ),
      );
      if (currentFranchise && currentFranchise._id === franchiseId) {
        setCurrentFranchise((prev) => ({
          ...prev,
          followers: Math.max(0, (prev.followers || 0) - 1),
        }));
      }
      fetchMyFollowing();
    } catch (err) {
      console.error("Unfollow franchise failed:", err);
      throw new Error(
        err.response?.data?.message || "Failed to unfollow franchise",
      );
    }
  };

  // Admin / Seed default franchises
  const seedFranchises = async () => {
    try {
      setLoading(true);
      const res = await API.post("/franchises/seed");
      const list = res.data.franchises || [];
      setFranchises(list);
      return list;
    } catch (err) {
      console.error("Seed franchises failed:", err);
      throw new Error("Failed to seed default franchises");
    } finally {
      setLoading(false);
    }
  };

  // Admin: Create new franchise
  const createFranchise = async (franchiseData) => {
    try {
      setLoading(true);
      const res = await API.post("/franchises", franchiseData);
      setFranchises((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.error("Create franchise failed:", err);
      throw new Error(
        err.response?.data?.message || "Failed to create franchise",
      );
    } finally {
      setLoading(false);
    }
  };

  // Admin: Update franchise
  const updateFranchise = async (id, franchiseData) => {
    try {
      setLoading(true);
      const res = await API.put(`/franchises/${id}`, franchiseData);
      setFranchises((prev) => prev.map((f) => (f._id === id ? res.data : f)));
      if (currentFranchise && currentFranchise._id === id) {
        setCurrentFranchise(res.data);
      }
      return res.data;
    } catch (err) {
      console.error("Update franchise failed:", err);
      throw new Error(
        err.response?.data?.message || "Failed to update franchise",
      );
    } finally {
      setLoading(false);
    }
  };

  // Admin: Delete franchise
  const deleteFranchise = async (id) => {
    try {
      setLoading(true);
      await API.delete(`/franchises/${id}`);
      setFranchises((prev) => prev.filter((f) => f._id !== id));
      if (currentFranchise && currentFranchise._id === id) {
        setCurrentFranchise(null);
      }
    } catch (err) {
      console.error("Delete franchise failed:", err);
      throw new Error(
        err.response?.data?.message || "Failed to delete franchise",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FranchiseContext.Provider
      value={{
        franchises,
        myFollowing,
        followingIds,
        currentFranchise,
        franchiseContent,
        loading,
        contentLoading,
        error,
        fetchFranchises,
        fetchMyFollowing,
        fetchFranchiseDetails,
        fetchFranchiseContent,
        followFranchise,
        unfollowFranchise,
        seedFranchises,
        createFranchise,
        updateFranchise,
        deleteFranchise,
      }}
    >
      {children}
    </FranchiseContext.Provider>
  );
};

export const useFranchise = () => {
  const context = useContext(FranchiseContext);
  if (!context) {
    throw new Error("useFranchise must be used within a FranchiseProvider");
  }
  return context;
};
