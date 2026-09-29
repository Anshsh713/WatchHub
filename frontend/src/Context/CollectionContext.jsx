import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import API from "../Services/Axios_api";
import { useSelector } from "react-redux";

const CollectionContext = createContext();

export const CollectionProvider = ({ children }) => {
  const { status: authStatus } = useSelector((state) => state.auth);

  // Collection lists state
  const [myCollections, setMyCollections] = useState([]);
  const [followingCollections, setFollowingCollections] = useState([]);
  const [sharedCollections, setSharedCollections] = useState([]);
  const [discoverCollections, setDiscoverCollections] = useState([]);
  const [userProfileCollections, setUserProfileCollections] = useState([]);

  // Active collection & user interactions
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [userInteractions, setUserInteractions] = useState({
    isOwner: false,
    userRole: null,
    hasLiked: false,
    voteType: null,
    personalRating: null,
    isFollowing: false,
  });

  // Reviews, Activity, Collaborators
  const [collectionReviews, setCollectionReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [collectionActivity, setCollectionActivity] = useState([]);

  // Loaders & Pagination
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination for discovery
  const [discoverTotalPages, setDiscoverTotalPages] = useState(1);
  const [discoverTotal, setDiscoverTotal] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | 1. FETCH MY COLLECTIONS
  |--------------------------------------------------------------------------
  */
  const fetchMyCollections = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/collections", { params });
      setMyCollections(res.data.collections || []);
      return res.data;
    } catch (err) {
      console.error("fetchMyCollections error:", err);
      setError(err.response?.data?.message || "Failed to load collections");
      return { collections: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | 2. FETCH FOLLOWING COLLECTIONS
  |--------------------------------------------------------------------------
  */
  const fetchFollowingCollections = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/collections/following", { params });
      setFollowingCollections(res.data.collections || []);
      return res.data;
    } catch (err) {
      console.error("fetchFollowingCollections error:", err);
      setError(err.response?.data?.message || "Failed to load followed collections");
      return { collections: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | 3. FETCH SHARED COLLECTIONS
  |--------------------------------------------------------------------------
  */
  const fetchSharedCollections = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/collections/shared", { params });
      setSharedCollections(res.data.collections || []);
      return res.data;
    } catch (err) {
      console.error("fetchSharedCollections error:", err);
      setError(err.response?.data?.message || "Failed to load shared collections");
      return { collections: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | 4. FETCH DISCOVER COLLECTIONS
  |--------------------------------------------------------------------------
  */
  const fetchDiscoverCollections = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = "/collections/public";
      if (params.sort === "trending") {
        endpoint = "/collections/trending";
      }

      const res = await API.get(endpoint, { params });
      setDiscoverCollections(res.data.collections || []);
      setDiscoverTotalPages(res.data.totalPages || 1);
      setDiscoverTotal(res.data.total || 0);
      return res.data;
    } catch (err) {
      console.error("fetchDiscoverCollections error:", err);
      setError(err.response?.data?.message || "Failed to load public collections");
      return { collections: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | 5. SEARCH COLLECTIONS
  |--------------------------------------------------------------------------
  */
  const searchCollections = useCallback(async (query, filters = {}) => {
    if (!query || !query.trim()) return { collections: [], total: 0 };
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/collections/search", {
        params: { q: query.trim(), ...filters },
      });
      return res.data;
    } catch (err) {
      console.error("searchCollections error:", err);
      return { collections: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | 6. FETCH COLLECTION DETAILS
  |--------------------------------------------------------------------------
  */
  const fetchCollectionDetails = useCallback(async (identifier) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/collections/${identifier}`);
      setSelectedCollection(res.data.collection);
      setUserInteractions(
        res.data.userInteractions || {
          isOwner: false,
          userRole: null,
          hasLiked: false,
          voteType: null,
          personalRating: null,
          isFollowing: false,
        }
      );
      return res.data;
    } catch (err) {
      console.error("fetchCollectionDetails error:", err);
      const msg = err.response?.data?.message || "Failed to load collection details";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | 7. CREATE / UPDATE / DELETE COLLECTION
  |--------------------------------------------------------------------------
  */
  const createCollection = async (collectionData) => {
    try {
      setActionLoading(true);
      const res = await API.post("/collections", collectionData);
      setMyCollections((prev) => [res.data.collection, ...prev]);
      return res.data.collection;
    } catch (err) {
      console.error("createCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to create collection");
    } finally {
      setActionLoading(false);
    }
  };

  const updateCollection = async (id, updatedData) => {
    try {
      setActionLoading(true);
      const res = await API.patch(`/collections/${id}`, updatedData);
      const updated = res.data.collection;

      setSelectedCollection((prev) => (prev?._id === id ? { ...prev, ...updated } : prev));
      setMyCollections((prev) => prev.map((c) => (c._id === id ? { ...c, ...updated } : c)));

      return updated;
    } catch (err) {
      console.error("updateCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to update collection");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCollection = async (id) => {
    try {
      setActionLoading(true);
      await API.delete(`/collections/${id}`);
      setMyCollections((prev) => prev.filter((c) => c._id !== id));
      if (selectedCollection?._id === id) {
        setSelectedCollection(null);
      }
      return true;
    } catch (err) {
      console.error("deleteCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to delete collection");
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 8. MEDIA ITEMS MANAGEMENT
  |--------------------------------------------------------------------------
  */
  const addMediaToCollection = async (collectionId, mediaData) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/collections/${collectionId}/media`, mediaData);
      const updated = res.data.collection;

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection(updated);
      }
      setMyCollections((prev) =>
        prev.map((c) => (c._id === collectionId ? { ...c, stats: updated.stats } : c))
      );

      return updated;
    } catch (err) {
      console.error("addMediaToCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to add media item");
    } finally {
      setActionLoading(false);
    }
  };

  const removeMediaFromCollection = async (collectionId, mediaId) => {
    try {
      setActionLoading(true);
      const res = await API.delete(`/collections/${collectionId}/media/${mediaId}`);
      const updated = res.data.collection;

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection(updated);
      }
      return updated;
    } catch (err) {
      console.error("removeMediaFromCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to remove media item");
    } finally {
      setActionLoading(false);
    }
  };

  const reorderMedia = async (collectionId, itemOrders) => {
    try {
      const res = await API.patch(`/collections/${collectionId}/reorder`, { itemOrders });
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          items: res.data.items,
        }));
      }
      return res.data.items;
    } catch (err) {
      console.error("reorderMedia error:", err);
      throw new Error(err.response?.data?.message || "Failed to reorder items");
    }
  };

  const updateMediaNote = async (collectionId, mediaId, note, noteIsPrivate) => {
    try {
      const res = await API.patch(`/collections/${collectionId}/media/${mediaId}/note`, {
        note,
        noteIsPrivate,
      });

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          items: prev.items.map((it) =>
            it._id === mediaId ? { ...it, note, noteIsPrivate } : it
          ),
        }));
      }
      return res.data.item;
    } catch (err) {
      console.error("updateMediaNote error:", err);
      throw new Error(err.response?.data?.message || "Failed to update note");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 9. SECTIONS MANAGEMENT
  |--------------------------------------------------------------------------
  */
  const createSection = async (collectionId, name) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/collections/${collectionId}/sections`, { name });
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          sections: res.data.sections,
        }));
      }
      return res.data.sections;
    } catch (err) {
      console.error("createSection error:", err);
      throw new Error(err.response?.data?.message || "Failed to create section");
    } finally {
      setActionLoading(false);
    }
  };

  const updateSection = async (collectionId, sectionId, data) => {
    try {
      const res = await API.patch(`/collections/${collectionId}/sections/${sectionId}`, data);
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          sections: res.data.sections,
        }));
      }
      return res.data.sections;
    } catch (err) {
      console.error("updateSection error:", err);
      throw new Error(err.response?.data?.message || "Failed to update section");
    }
  };

  const deleteSection = async (collectionId, sectionId) => {
    try {
      setActionLoading(true);
      const res = await API.delete(`/collections/${collectionId}/sections/${sectionId}`);
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          sections: res.data.sections,
          items: res.data.items || prev.items,
        }));
      }
      return res.data;
    } catch (err) {
      console.error("deleteSection error:", err);
      throw new Error(err.response?.data?.message || "Failed to delete section");
    } finally {
      setActionLoading(false);
    }
  };

  const reorderSections = async (collectionId, sectionOrders) => {
    try {
      const res = await API.patch(`/collections/${collectionId}/sections/reorder`, {
        sectionOrders,
      });
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          sections: res.data.sections,
        }));
      }
      return res.data.sections;
    } catch (err) {
      console.error("reorderSections error:", err);
      throw new Error(err.response?.data?.message || "Failed to reorder sections");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 10. SOCIAL INTERACTIONS: LIKES, VOTES, RATINGS, FOLLOWS, COPY
  |--------------------------------------------------------------------------
  */
  const toggleLike = async (collectionId) => {
    try {
      const isLiked = userInteractions.hasLiked;
      let res;
      if (isLiked) {
        res = await API.delete(`/collections/${collectionId}/like`);
      } else {
        res = await API.post(`/collections/${collectionId}/like`);
      }

      setUserInteractions((prev) => ({
        ...prev,
        hasLiked: !isLiked,
      }));

      setSelectedCollection((prev) =>
        prev?._id === collectionId
          ? {
              ...prev,
              engagement: { ...prev.engagement, likes: res.data.likes },
            }
          : prev
      );

      return res.data;
    } catch (err) {
      console.error("toggleLike error:", err);
      throw err;
    }
  };

  const submitVote = async (collectionId, voteType) => {
    try {
      let res;
      if (userInteractions.voteType === voteType) {
        // Toggle off
        res = await API.delete(`/collections/${collectionId}/vote`);
        setUserInteractions((prev) => ({ ...prev, voteType: null }));
      } else {
        res = await API.post(`/collections/${collectionId}/vote`, { voteType });
        setUserInteractions((prev) => ({ ...prev, voteType }));
      }

      setSelectedCollection((prev) =>
        prev?._id === collectionId
          ? {
              ...prev,
              voteScore: res.data.voteScore,
              engagement: {
                ...prev.engagement,
                upvotes: res.data.upvotes,
                downvotes: res.data.downvotes,
              },
            }
          : prev
      );

      return res.data;
    } catch (err) {
      console.error("submitVote error:", err);
      throw err;
    }
  };

  const submitRating = async (collectionId, rating) => {
    try {
      const res = await API.post(`/collections/${collectionId}/rating`, { rating });
      setUserInteractions((prev) => ({
        ...prev,
        personalRating: res.data.personalRating,
      }));

      setSelectedCollection((prev) =>
        prev?._id === collectionId
          ? {
              ...prev,
              averageRating: res.data.averageRating,
              ratingCount: res.data.ratingCount,
            }
          : prev
      );

      return res.data;
    } catch (err) {
      console.error("submitRating error:", err);
      throw err;
    }
  };

  const removeRating = async (collectionId) => {
    try {
      const res = await API.delete(`/collections/${collectionId}/rating`);
      setUserInteractions((prev) => ({
        ...prev,
        personalRating: null,
      }));

      setSelectedCollection((prev) =>
        prev?._id === collectionId
          ? {
              ...prev,
              averageRating: res.data.averageRating,
              ratingCount: res.data.ratingCount,
            }
          : prev
      );

      return res.data;
    } catch (err) {
      console.error("removeRating error:", err);
      throw err;
    }
  };

  const toggleFollow = async (collectionId) => {
    try {
      const isFollowing = userInteractions.isFollowing;
      let res;
      if (isFollowing) {
        res = await API.delete(`/collections/${collectionId}/follow`);
      } else {
        res = await API.post(`/collections/${collectionId}/follow`);
      }

      setUserInteractions((prev) => ({
        ...prev,
        isFollowing: !isFollowing,
      }));

      setSelectedCollection((prev) =>
        prev?._id === collectionId
          ? {
              ...prev,
              engagement: { ...prev.engagement, followers: res.data.followers },
            }
          : prev
      );

      return res.data;
    } catch (err) {
      console.error("toggleFollow error:", err);
      throw err;
    }
  };

  const copyCollection = async (collectionId) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/collections/${collectionId}/copy`);
      setMyCollections((prev) => [res.data.collection, ...prev]);

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            copies: (prev.engagement?.copies || 0) + 1,
          },
        }));
      }

      return res.data.collection;
    } catch (err) {
      console.error("copyCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to copy collection");
    } finally {
      setActionLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 11. REVIEWS
  |--------------------------------------------------------------------------
  */
  const fetchReviews = useCallback(async (collectionId, params = {}) => {
    try {
      setReviewsLoading(true);
      const res = await API.get(`/collections/${collectionId}/reviews`, { params });
      setCollectionReviews(res.data.reviews || []);
      setReviewsTotal(res.data.total || 0);
      return res.data;
    } catch (err) {
      console.error("fetchReviews error:", err);
      return { reviews: [], total: 0 };
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const addReview = async (collectionId, rating, reviewText) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/collections/${collectionId}/reviews`, {
        rating,
        reviewText,
      });

      setCollectionReviews((prev) => [res.data.review, ...prev]);
      setReviewsTotal((prev) => prev + 1);

      setUserInteractions((prev) => ({
        ...prev,
        personalRating: rating,
      }));

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            reviews: (prev.engagement?.reviews || 0) + 1,
          },
        }));
      }

      return res.data.review;
    } catch (err) {
      console.error("addReview error:", err);
      throw new Error(err.response?.data?.message || "Failed to add review");
    } finally {
      setActionLoading(false);
    }
  };

  const updateReview = async (collectionId, reviewId, rating, reviewText) => {
    try {
      setActionLoading(true);
      const res = await API.patch(`/collections/${collectionId}/reviews/${reviewId}`, {
        rating,
        reviewText,
      });

      setCollectionReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? res.data.review : r))
      );

      return res.data.review;
    } catch (err) {
      console.error("updateReview error:", err);
      throw new Error(err.response?.data?.message || "Failed to update review");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async (collectionId, reviewId) => {
    try {
      setActionLoading(true);
      await API.delete(`/collections/${collectionId}/reviews/${reviewId}`);
      setCollectionReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setReviewsTotal((prev) => Math.max(0, prev - 1));

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            reviews: Math.max(0, (prev.engagement?.reviews || 1) - 1),
          },
        }));
      }

      return true;
    } catch (err) {
      console.error("deleteReview error:", err);
      throw new Error(err.response?.data?.message || "Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  const voteReview = async (collectionId, reviewId, type) => {
    try {
      const res = await API.post(`/collections/${collectionId}/reviews/${reviewId}/vote`, {
        type,
      });

      setCollectionReviews((prev) =>
        prev.map((r) => {
          if (r._id === reviewId) {
            return {
              ...r,
              helpfulCount: res.data.helpfulCount,
              unhelpfulCount: res.data.unhelpfulCount,
              userVotedHelpful: type === "helpful" ? !r.userVotedHelpful : false,
              userVotedUnhelpful: type === "unhelpful" ? !r.userVotedUnhelpful : false,
            };
          }
          return r;
        })
      );

      return res.data;
    } catch (err) {
      console.error("voteReview error:", err);
      throw err;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 12. COLLABORATORS & ACTIVITY
  |--------------------------------------------------------------------------
  */
  const addCollaborator = async (collectionId, usernameOrEmail, role) => {
    try {
      setActionLoading(true);
      const res = await API.post(`/collections/${collectionId}/collaborators`, {
        usernameOrEmail,
        role,
      });

      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          collaborators: res.data.collaborators,
        }));
      }

      return res.data;
    } catch (err) {
      console.error("addCollaborator error:", err);
      throw new Error(err.response?.data?.message || "Failed to add collaborator");
    } finally {
      setActionLoading(false);
    }
  };

  const updateCollaboratorRole = async (collectionId, userId, role) => {
    try {
      const res = await API.patch(`/collections/${collectionId}/collaborators/${userId}`, {
        role,
      });
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          collaborators: res.data.collaborators,
        }));
      }
      return res.data;
    } catch (err) {
      console.error("updateCollaboratorRole error:", err);
      throw new Error(err.response?.data?.message || "Failed to update collaborator role");
    }
  };

  const removeCollaborator = async (collectionId, userId) => {
    try {
      const res = await API.delete(`/collections/${collectionId}/collaborators/${userId}`);
      if (selectedCollection?._id === collectionId) {
        setSelectedCollection((prev) => ({
          ...prev,
          collaborators: res.data.collaborators,
        }));
      }
      return res.data;
    } catch (err) {
      console.error("removeCollaborator error:", err);
      throw new Error(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  const fetchActivity = async (collectionId) => {
    try {
      const res = await API.get(`/collections/${collectionId}/activity`);
      setCollectionActivity(res.data.activity || []);
      return res.data.activity;
    } catch (err) {
      console.error("fetchActivity error:", err);
      return [];
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 13. REPORTING
  |--------------------------------------------------------------------------
  */
  const reportCollection = async (collectionId, reason, details) => {
    try {
      const res = await API.post(`/collections/${collectionId}/report`, {
        reason,
        details,
      });
      return res.data;
    } catch (err) {
      console.error("reportCollection error:", err);
      throw new Error(err.response?.data?.message || "Failed to submit report");
    }
  };

  const reportReview = async (collectionId, reviewId, reason, details) => {
    try {
      const res = await API.post(`/collections/${collectionId}/reviews/${reviewId}/report`, {
        reason,
        details,
      });
      return res.data;
    } catch (err) {
      console.error("reportReview error:", err);
      throw new Error(err.response?.data?.message || "Failed to submit report");
    }
  };

  const fetchUserCollections = async (userId) => {
    try {
      const res = await API.get(`/collections/user/${userId}`);
      setUserProfileCollections(res.data.collections || []);
      return res.data.collections;
    } catch (err) {
      console.error("fetchUserCollections error:", err);
      return [];
    }
  };

  return (
    <CollectionContext.Provider
      value={{
        myCollections,
        followingCollections,
        sharedCollections,
        discoverCollections,
        userProfileCollections,
        selectedCollection,
        userInteractions,
        collectionReviews,
        reviewsTotal,
        collectionActivity,
        loading,
        actionLoading,
        reviewsLoading,
        error,
        discoverTotalPages,
        discoverTotal,
        fetchMyCollections,
        fetchFollowingCollections,
        fetchSharedCollections,
        fetchDiscoverCollections,
        searchCollections,
        fetchCollectionDetails,
        createCollection,
        updateCollection,
        deleteCollection,
        addMediaToCollection,
        removeMediaFromCollection,
        reorderMedia,
        updateMediaNote,
        createSection,
        updateSection,
        deleteSection,
        reorderSections,
        toggleLike,
        submitVote,
        submitRating,
        removeRating,
        toggleFollow,
        copyCollection,
        fetchReviews,
        addReview,
        updateReview,
        deleteReview,
        voteReview,
        addCollaborator,
        updateCollaboratorRole,
        removeCollaborator,
        fetchActivity,
        reportCollection,
        reportReview,
        fetchUserCollections,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollections = () => useContext(CollectionContext);
