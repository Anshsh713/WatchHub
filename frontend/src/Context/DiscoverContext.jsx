import React, { createContext, useContext, useState } from "react";

import API from "../Services/Axios_api";

const DiscoverContext = createContext();

export const DiscoverProvider = ({ children }) => {
  const [upcoming, setUpcoming] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [calendar, setCalendar] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [hasMoreUpcoming, setHasMoreUpcoming] = useState(true);

  const fetchUpcoming = async (type = "all", range = "month", page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("/discover/upcoming", {
        params: {
          type,
          range,
          page,
        },
      });

      if (page === 1) {
        setUpcoming(response.data.results);
      } else {
        setUpcoming((prev) => [...prev, ...response.data.results]);
      }

      setUpcomingPage(page);

      setHasMoreUpcoming(response.data.results.length > 0);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch upcoming media");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrailers = async (type = "all", range = "month") => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("/discover/trailers", {
        params: {
          type,
          range,
        },
      });

      setTrailers(response.data.results);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch trailers");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncements = async (type = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("/discover/announcements", {
        params: type ? { type } : {},
      });

      setAnnouncements(response.data.results);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendar = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const response = await API.get("/discover/calendar", {
        params: { date },
      });

      setCalendar(response.data.results);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch release calendar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DiscoverContext.Provider
      value={{
        upcoming,
        trailers,
        announcements,
        calendar,

        loading,
        error,

        upcomingPage,
        hasMoreUpcoming,

        fetchUpcoming,
        fetchTrailers,
        fetchAnnouncements,
        fetchCalendar,
      }}
    >
      {children}
    </DiscoverContext.Provider>
  );
};

export const useDiscover = () => useContext(DiscoverContext);
