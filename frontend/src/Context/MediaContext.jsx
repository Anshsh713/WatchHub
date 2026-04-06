import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [all, setAll] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tvshow, setTVshow] = useState([]);
  const [anime, setAnime] = useState([]);
  const [mediaDetails, setMediaDetails] = useState(null);
  const [currentType, setCurrentType] = useState(
    localStorage.getItem("mediaType") || "all",
  );
  const [typesofmedia, setTypesofmedia] = useState([]);
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
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch media");
    }
  };

  const fetchMediaDetails = async (media_id, media_type) => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get(`/media/${media_id}`, {
        params: { type: media_type },
      });
      setMediaDetails(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch Media Data");
    }
  };

  const fetchGenres = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("media/genres");
      setTypesofmedia(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch genres");
    }
  };

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("media/countries");
      setTypesofmedia(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch countries");
    }
  };

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("media/languages");
      setTypesofmedia(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch languages");
    }
  };

  useEffect(() => {
    let themeClass = "";
    if (currentType === "movie") themeClass = "theme-movie";
    else if (currentType === "tv") themeClass = "theme-tv";
    else if (currentType === "anime") themeClass = "theme-anime";
    else themeClass = "";

    document.body.className = themeClass;
    localStorage.setItem("mediaType", currentType);
  }, [currentType]);

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
        fetchMediaDetails,
        mediaDetails,
        fetchGenres,
        fetchCountries,
        fetchLanguages,
        typesofmedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
