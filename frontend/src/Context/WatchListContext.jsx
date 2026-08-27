import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import API from "../Services/Axios_api";
import { useSelector } from "react-redux";

const WatchListContext = createContext();

export const WatchListProvider = ({ children }) => {
  const { status: authStatus } = useSelector((state) => state.auth);

  const [watchlist, setWatchlist] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    want_to_watch: 0,
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
    movieCount: 0,
    tvCount: 0,
    animeCount: 0,
    ratedCount: 0,
    averageRating: 0,
  });
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    want_to_watch: 0,
    watching: 0,
    completed: 0,
    on_hold: 0,
    dropped: 0,
  });
  const [typeCounts, setTypeCounts] = useState({
    all: 0,
    movie: 0,
    tv: 0,
    anime: 0,
  });

  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState({ today: [], yesterday: [], older: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & meta
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active filters
  const [mediaType, setMediaType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  // Local cache map for fast inWatchlist status check: key = `${mediaType}-${tmdbId}`
  const [watchlistMap, setWatchlistMap] = useState({});

  // Re-build fast lookup map whenever watchlist updates
  const updateLocalMap = (items) => {
    const map = {};
    items.forEach((item) => {
      map[`${item.mediaType}-${item.tmdbId}`] = item;
    });
    setWatchlistMap(map);
  };

  /*
  |--------------------------------------------------------------------------
  | 1. FETCH WATCHLIST
  |--------------------------------------------------------------------------
  */
  const fetchWatchlist = useCallback(
    async (params = {}) => {
      if (!authStatus) return;

      const activeType = params.type !== undefined ? params.type : mediaType;
      const activeStatus = params.status !== undefined ? params.status : statusFilter;
      const activeSearch = params.search !== undefined ? params.search : searchQuery;
      const activeSort = params.sort !== undefined ? params.sort : sortOption;
      const activePage = params.page !== undefined ? params.page : page;

      try {
        setLoading(true);
        setError(null);

        const res = await API.get("/watchlist", {
          params: {
            type: activeType,
            status: activeStatus,
            search: activeSearch,
            sort: activeSort,
            page: activePage,
            limit: 24,
          },
        });

        setWatchlist(res.data.results || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        setPage(res.data.page || 1);

        if (res.data.statusCounts) {
          setStatusCounts(res.data.statusCounts);
        }
        if (res.data.typeCounts) {
          setTypeCounts(res.data.typeCounts);
        }

        updateLocalMap(res.data.results || []);
      } catch (err) {
        console.error("WatchList fetch error:", err);
        setError(err.response?.data?.message || "Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    },
    [authStatus, mediaType, statusFilter, searchQuery, sortOption, page],
  );

  /*
  |--------------------------------------------------------------------------
  | 2. FETCH STATS
  |--------------------------------------------------------------------------
  */
  const fetchStats = useCallback(async () => {
    if (!authStatus) return;
    try {
      const res = await API.get("/watchlist/stats");
      setStats(res.data.stats || {});
    } catch (err) {
      console.error("WatchList stats error:", err);
    }
  }, [authStatus]);

  /*
  |--------------------------------------------------------------------------
  | 3. FETCH UPCOMING
  |--------------------------------------------------------------------------
  */
  const fetchUpcoming = useCallback(async () => {
    if (!authStatus) return;
    try {
      setLoadingUpcoming(true);
      const res = await API.get("/watchlist/upcoming");
      setUpcoming(res.data.results || []);
    } catch (err) {
      console.error("WatchList upcoming error:", err);
    } finally {
      setLoadingUpcoming(false);
    }
  }, [authStatus]);

  /*
  |--------------------------------------------------------------------------
  | 4. FETCH HISTORY
  |--------------------------------------------------------------------------
  */
  const fetchHistory = useCallback(async () => {
    if (!authStatus) return;
    try {
      setLoadingHistory(true);
      const res = await API.get("/watchlist/history");
      setHistory(res.data.history || { today: [], yesterday: [], older: [], total: 0 });
    } catch (err) {
      console.error("WatchList history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [authStatus]);

  /*
  |--------------------------------------------------------------------------
  | 5. FETCH SINGLE ITEM (for detail page status check)
  |--------------------------------------------------------------------------
  */
  const fetchWatchlistItem = useCallback(
    async (mediaId, mediaType) => {
      if (!authStatus || !mediaId || !mediaType) return null;
      try {
        const res = await API.get(`/watchlist/item/${mediaType}/${mediaId}`);
        if (res.data.item) {
          setWatchlistMap((prev) => ({
            ...prev,
            [`${mediaType}-${mediaId}`]: res.data.item,
          }));
        }
        return res.data.item;
      } catch (err) {
        console.error("WatchList item check error:", err);
        return null;
      }
    },
    [authStatus],
  );

  /*
  |--------------------------------------------------------------------------
  | 6. ADD TO WATCHLIST
  |--------------------------------------------------------------------------
  */
  const addToWatchlist = async (mediaData) => {
    if (!authStatus) throw new Error("Authentication required");
    try {
      const res = await API.post("/watchlist", mediaData);
      const item = res.data.item;

      // Update state locally
      setWatchlistMap((prev) => ({
        ...prev,
        [`${item.mediaType}-${item.tmdbId}`]: item,
      }));

      // Refresh list & stats
      fetchWatchlist();
      fetchStats();
      fetchUpcoming();

      return item;
    } catch (err) {
      console.error("Add to watchlist error:", err);
      throw err;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 7. UPDATE STATUS
  |--------------------------------------------------------------------------
  */
  const updateStatus = async (mediaId, mediaType, status) => {
    if (!authStatus) throw new Error("Authentication required");
    try {
      const res = await API.patch(`/watchlist/${mediaType}/${mediaId}/status`, { status });
      const updated = res.data.item;

      setWatchlist((prev) =>
        prev.map((item) =>
          item.tmdbId === Number(mediaId) && item.mediaType === mediaType ? updated : item,
        ),
      );

      setWatchlistMap((prev) => ({
        ...prev,
        [`${mediaType}-${mediaId}`]: updated,
      }));

      fetchStats();
      fetchHistory();
      return updated;
    } catch (err) {
      console.error("Update status error:", err);
      throw err;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 8. UPDATE RATING & NOTES
  |--------------------------------------------------------------------------
  */
  const updateRating = async (mediaId, mediaType, rating, notes = "") => {
    if (!authStatus) throw new Error("Authentication required");
    try {
      const res = await API.patch(`/watchlist/${mediaType}/${mediaId}/rating`, {
        rating,
        notes,
      });
      const updated = res.data.item;

      setWatchlist((prev) =>
        prev.map((item) =>
          item.tmdbId === Number(mediaId) && item.mediaType === mediaType ? updated : item,
        ),
      );

      setWatchlistMap((prev) => ({
        ...prev,
        [`${mediaType}-${mediaId}`]: updated,
      }));

      fetchStats();
      return updated;
    } catch (err) {
      console.error("Update rating error:", err);
      throw err;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 9. UPDATE FULL ITEM
  |--------------------------------------------------------------------------
  */
  const updateItem = async (mediaId, mediaType, updates) => {
    if (!authStatus) throw new Error("Authentication required");
    try {
      const res = await API.patch(`/watchlist/${mediaType}/${mediaId}`, updates);
      const updated = res.data.item;

      setWatchlist((prev) =>
        prev.map((item) =>
          item.tmdbId === Number(mediaId) && item.mediaType === mediaType ? updated : item,
        ),
      );

      setWatchlistMap((prev) => ({
        ...prev,
        [`${mediaType}-${mediaId}`]: updated,
      }));

      fetchStats();
      fetchHistory();
      fetchUpcoming();
      return updated;
    } catch (err) {
      console.error("Update item error:", err);
      throw err;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 10. REMOVE FROM WATCHLIST
  |--------------------------------------------------------------------------
  */
  const removeFromWatchlist = async (mediaId, mediaType) => {
    if (!authStatus) throw new Error("Authentication required");
    try {
      await API.delete(`/watchlist/${mediaType}/${mediaId}`);

      setWatchlist((prev) =>
        prev.filter(
          (item) => !(item.tmdbId === Number(mediaId) && item.mediaType === mediaType),
        ),
      );

      setWatchlistMap((prev) => {
        const next = { ...prev };
        delete next[`${mediaType}-${mediaId}`];
        return next;
      });

      fetchStats();
      fetchUpcoming();
      fetchHistory();
    } catch (err) {
      console.error("Remove from watchlist error:", err);
      throw err;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 11. MARK AS UNWATCHED
  |--------------------------------------------------------------------------
  */
  const markAsUnwatched = async (mediaId, mediaType) => {
    if (!authStatus) return;
    try {
      await API.patch(`/watchlist/history/${mediaType}/${mediaId}`);
      fetchHistory();
      fetchWatchlist();
      fetchStats();
    } catch (err) {
      console.error("Mark as unwatched error:", err);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 12. CLEAR HISTORY
  |--------------------------------------------------------------------------
  */
  const clearHistory = async () => {
    if (!authStatus) return;
    try {
      await API.delete("/watchlist/history");
      setHistory({ today: [], yesterday: [], older: [], total: 0 });
      fetchWatchlist();
      fetchStats();
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  // Helper check
  const isInWatchlist = (mediaId, mediaType) => {
    return Boolean(watchlistMap[`${mediaType}-${mediaId}`]);
  };

  const getWatchlistItemData = (mediaId, mediaType) => {
    return watchlistMap[`${mediaType}-${mediaId}`] || null;
  };

  // Initial load when logged in
  useEffect(() => {
    if (authStatus) {
      fetchWatchlist();
      fetchStats();
      fetchUpcoming();
      fetchHistory();
    } else {
      setWatchlist([]);
      setWatchlistMap({});
      setUpcoming([]);
      setHistory({ today: [], yesterday: [], older: [], total: 0 });
    }
  }, [authStatus]);

  return (
    <WatchListContext.Provider
      value={{
        // Data
        watchlist,
        stats,
        statusCounts,
        typeCounts,
        upcoming,
        history,
        loading,
        loadingUpcoming,
        loadingHistory,
        error,

        // Pagination & Meta
        page,
        totalPages,
        totalCount,

        // Filters
        mediaType,
        statusFilter,
        searchQuery,
        sortOption,
        setMediaType,
        setStatusFilter,
        setSearchQuery,
        setSortOption,
        setPage,

        // Actions
        fetchWatchlist,
        fetchStats,
        fetchUpcoming,
        fetchHistory,
        fetchWatchlistItem,
        addToWatchlist,
        removeFromWatchlist,
        updateStatus,
        updateRating,
        updateItem,
        markAsUnwatched,
        clearHistory,
        isInWatchlist,
        getWatchlistItemData,
      }}
    >
      {children}
    </WatchListContext.Provider>
  );
};

export const useWatchList = () => {
  const context = useContext(WatchListContext);
  if (!context) {
    throw new Error("useWatchList must be used within a WatchListProvider");
  }
  return context;
};
