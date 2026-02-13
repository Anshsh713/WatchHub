import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentType, setCurrentType] = useState(
    localStorage.getItem("mediaType") || "all",
  );

  const [all, setAll] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvshow, setTVshow] = useState([]);
  const [anime, setAnime] = useState([]);

  const mediaMap = { all, movie: movies, tv: tvshow, anime };

  const fetchMedia = async (type = currentType) => {
    try {
      setLoading(true);
      setError(null);

      const res1 = await API.get("/media", {
        params: { type: "all" },
      });
      setAll(res1.data.results);
      const res2 = await API.get("/media", {
        params: { type: "movie" },
      });
      setMovies(res2.data.results);
      const res3 = await API.get("/media", {
        params: { type: "tv" },
      });
      setTVshow(res3.data.results);
      const res4 = await API.get("/media", {
        params: { type: "anime" },
      });
      setAnime(res4.data.results);
      setCurrentType(type);
      localStorage.setItem("mediaType", type);
    } catch (err) {
      setError("Failed to fetch media");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchMedia(currentType);
  }, []);

  return (
    <MediaContext.Provider
      value={{
        mediaMap,
        loading,
        error,
        setCurrentType,
        currentType,
        fetchMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
