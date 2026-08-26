import React, { createContext, useContext, useState, useCallback } from "react";
import API from "../Services/Axios_api";

const DiscoverContext = createContext();

export const DiscoverProvider = ({ children }) => {
  // Section states
  const [releasingToday, setReleasingToday] = useState([]);
  const [releasingThisWeek, setReleasingThisWeek] = useState([]);
  const [thisMonth, setThisMonth] = useState([]);
  const [nextMonth, setNextMonth] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [upcomingTV, setUpcomingTV] = useState([]);
  const [upcomingAnime, setUpcomingAnime] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [visuals, setVisuals] = useState([]);
  const [dateChanges, setDateChanges] = useState([]);
  const [calendarResults, setCalendarResults] = useState([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [franchiseUpdates, setFranchiseUpdates] = useState([]);
  const [isPersonalizedFranchises, setIsPersonalizedFranchises] = useState(false);
  const [discussions, setDiscussions] = useState([]);

  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [loadingThisMonth, setLoadingThisMonth] = useState(false);
  const [loadingNextMonth, setLoadingNextMonth] = useState(false);
  const [loadingTrailers, setLoadingTrailers] = useState(false);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Releasing Today
  const fetchReleasingToday = useCallback(async (type = "all") => {
    try {
      setLoadingToday(true);
      const res = await API.get("/discover/upcoming", {
        params: { type, range: "today" },
      });
      setReleasingToday(res.data.results || []);
    } catch (err) {
      console.error("Error fetching today releases:", err);
    } finally {
      setLoadingToday(false);
    }
  }, []);

  // 2. Fetch Releasing This Week
  const fetchReleasingThisWeek = useCallback(async (type = "all") => {
    try {
      setLoadingWeek(true);
      const res = await API.get("/discover/upcoming", {
        params: { type, range: "week" },
      });
      setReleasingThisWeek(res.data.results || []);
    } catch (err) {
      console.error("Error fetching week releases:", err);
    } finally {
      setLoadingWeek(false);
    }
  }, []);

  // 3. Fetch Coming This Month (in descending order)
  const fetchThisMonth = useCallback(async (type = "all") => {
    try {
      setLoadingThisMonth(true);
      const res = await API.get("/discover/upcoming", {
        params: { type, range: "month", sort: "desc" },
      });
      setThisMonth(res.data.results || []);
    } catch (err) {
      console.error("Error fetching this month:", err);
    } finally {
      setLoadingThisMonth(false);
    }
  }, []);

  // 4. Fetch Coming Next Month (in descending order)
  const fetchNextMonth = useCallback(async (type = "all") => {
    try {
      setLoadingNextMonth(true);
      const res = await API.get("/discover/upcoming", {
        params: { type, range: "nextMonth", sort: "desc" },
      });
      setNextMonth(res.data.results || []);
    } catch (err) {
      console.error("Error fetching next month:", err);
    } finally {
      setLoadingNextMonth(false);
    }
  }, []);

  // 5. Fetch Upcoming Movies (Releasing 2+ months ahead)
  const fetchUpcomingMovies = useCallback(async () => {
    try {
      const res = await API.get("/discover/upcoming", {
        params: { type: "movie", range: "upcoming" },
      });
      setUpcomingMovies(res.data.results || []);
    } catch (err) {
      console.error("Error fetching upcoming movies:", err);
    }
  }, []);

  // 6. Fetch Upcoming TV Shows (Releasing 2+ months ahead)
  const fetchUpcomingTV = useCallback(async () => {
    try {
      const res = await API.get("/discover/upcoming", {
        params: { type: "tv", range: "upcoming" },
      });
      setUpcomingTV(res.data.results || []);
    } catch (err) {
      console.error("Error fetching upcoming TV:", err);
    }
  }, []);

  // 7. Fetch Upcoming Anime (Releasing 2+ months ahead)
  const fetchUpcomingAnime = useCallback(async () => {
    try {
      const res = await API.get("/discover/upcoming", {
        params: { type: "anime", range: "upcoming" },
      });
      setUpcomingAnime(res.data.results || []);
    } catch (err) {
      console.error("Error fetching upcoming anime:", err);
    }
  }, []);

  // 8. Fetch Announcements
  const fetchAnnouncements = useCallback(async (type = null, search = "") => {
    try {
      setLoadingAnnouncements(true);
      const params = {};
      if (type && type !== "all") params.type = type;
      if (search) params.search = search;

      const res = await API.get("/discover/announcements", { params });
      setAnnouncements(res.data.results || []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);

  // 9. Fetch Trailers
  const fetchTrailers = useCallback(async (type = "all") => {
    try {
      setLoadingTrailers(true);
      const res = await API.get("/discover/trailers", {
        params: { type, range: "year" },
      });
      setTrailers(res.data.results || []);
    } catch (err) {
      console.error("Error fetching trailers:", err);
    } finally {
      setLoadingTrailers(false);
    }
  }, []);

  // 10. Fetch Visuals (Posters & First Looks)
  const fetchVisuals = useCallback(async () => {
    try {
      const res = await API.get("/discover/visuals");
      setVisuals(res.data.results || []);
    } catch (err) {
      console.error("Error fetching visuals:", err);
    }
  }, []);

  // 11. Fetch Release Date Changes
  const fetchReleaseDateChanges = useCallback(async () => {
    try {
      const res = await API.get("/discover/release-date-changes");
      setDateChanges(res.data.results || []);
    } catch (err) {
      console.error("Error fetching release date changes:", err);
    }
  }, []);

  // 12. Fetch Release Calendar
  const fetchCalendar = useCallback(async (date, type = "all") => {
    try {
      setLoadingCalendar(true);
      setSelectedCalendarDate(date);
      const res = await API.get("/discover/calendar", {
        params: { date, type },
      });
      setCalendarResults(res.data.results || []);
    } catch (err) {
      console.error("Error fetching calendar:", err);
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  // 13. Fetch Followed Franchise Updates
  const fetchFranchiseUpdates = useCallback(async () => {
    try {
      const res = await API.get("/discover/franchise-updates");
      setFranchiseUpdates(res.data.results || []);
      setIsPersonalizedFranchises(Boolean(res.data.isPersonalized));
    } catch (err) {
      console.error("Error fetching franchise updates:", err);
    }
  }, []);

  // 14. Fetch Trending Discussions
  const fetchDiscussions = useCallback(async () => {
    try {
      const res = await API.get("/discover/discussions");
      setDiscussions(res.data.results || []);
    } catch (err) {
      console.error("Error fetching discussions:", err);
    }
  }, []);

  // Load all initial data simultaneously
  const loadAllDiscoverData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const todayStr = new Date().toISOString().split("T")[0];

      await Promise.allSettled([
        fetchReleasingToday("all"),
        fetchReleasingThisWeek("all"),
        fetchThisMonth("all"),
        fetchNextMonth("all"),
        fetchUpcomingMovies(),
        fetchUpcomingTV(),
        fetchUpcomingAnime(),
        fetchTrailers("all"),
        fetchAnnouncements(),
        fetchVisuals(),
        fetchReleaseDateChanges(),
        fetchCalendar(todayStr, "all"),
        fetchFranchiseUpdates(),
        fetchDiscussions(),
      ]);
    } catch (err) {
      console.error("Failed to initialize Discover data:", err);
      setError("Failed to load discover content. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  }, [
    fetchReleasingToday,
    fetchReleasingThisWeek,
    fetchThisMonth,
    fetchNextMonth,
    fetchUpcomingMovies,
    fetchUpcomingTV,
    fetchUpcomingAnime,
    fetchTrailers,
    fetchAnnouncements,
    fetchVisuals,
    fetchReleaseDateChanges,
    fetchCalendar,
    fetchFranchiseUpdates,
    fetchDiscussions,
  ]);

  return (
    <DiscoverContext.Provider
      value={{
        // Data
        releasingToday,
        releasingThisWeek,
        thisMonth,
        nextMonth,
        upcomingMovies,
        upcomingTV,
        upcomingAnime,
        trailers,
        announcements,
        visuals,
        dateChanges,
        calendarResults,
        selectedCalendarDate,
        franchiseUpdates,
        isPersonalizedFranchises,
        discussions,

        // Loading states
        initialLoading,
        loadingToday,
        loadingWeek,
        loadingThisMonth,
        loadingNextMonth,
        loadingTrailers,
        loadingAnnouncements,
        loadingCalendar,
        error,

        // Actions
        fetchReleasingToday,
        fetchReleasingThisWeek,
        fetchThisMonth,
        fetchNextMonth,
        fetchUpcomingMovies,
        fetchUpcomingTV,
        fetchUpcomingAnime,
        fetchTrailers,
        fetchAnnouncements,
        fetchVisuals,
        fetchReleaseDateChanges,
        fetchCalendar,
        fetchFranchiseUpdates,
        fetchDiscussions,
        loadAllDiscoverData,
        setSelectedCalendarDate,
      }}
    >
      {children}
    </DiscoverContext.Provider>
  );
};

export const useDiscover = () => {
  const context = useContext(DiscoverContext);
  if (!context) {
    throw new Error("useDiscover must be used within a DiscoverProvider");
  }
  return context;
};
