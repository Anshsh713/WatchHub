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
  const [genresCache, setGenresCache] = useState([]);
  const [countriesCache, setCountriesCache] = useState([]);
  const [languagesCache, setLanguagesCache] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [homeSections, setHomeSections] = useState({
    trending: [],
    topRated: [],
    popularThisWeek: [],
    upcoming: [],
    hiddenGems: [],
    netflix: [],
    jiohotstar: [],
    prime: [],
    crunchyroll: [],
  });
  const [homeLoading, setHomeLoading] = useState(false);

  const mediaMap = { all, movie: movies, tv: tvshow, anime };

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

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
      setLoading(false);
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
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      if (genresCache.length > 0) {
        setTypesofmedia(genresCache);
        return;
      }
      setLoading(true);
      setError(null);

      const res = await API.get("media/genres");
      setGenresCache(res.data);
      setTypesofmedia(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch genres");
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      if (countriesCache.length > 0) {
        setTypesofmedia(countriesCache);
        return;
      }
      setLoading(true);
      setError(null);

      const res = await API.get("media/countries");
      setCountriesCache(res.data);
      setTypesofmedia(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch countries");
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      if (languagesCache.length > 0) {
        setTypesofmedia(languagesCache);
        return;
      }
      setLoading(true);
      setError(null);

      const res = await API.get("media/languages");
      setLanguagesCache(res.data);
      setTypesofmedia(res.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch languages");
      setLoading(false);
    }
  };

  const fetchMediaByGenre = async (genreId, newpage = 1, mediaType = "all") => {
    try {
      setLoading(true);
      setResults([]);
      setError(null);

      const res = await API.get("/media/genre", {
        params: {
          genreId,
          page: newpage,
          mediaType,
        },
      });

      if (newpage === 1) {
        setResults(res.data.results);
      } else {
        setResults((prev) => [...prev, ...res.data.results]);
      }

      setPage(newpage);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch media by genre");
      setLoading(false);
    }
  };

  const fetchMediaByCountry = async (
    countryCode,
    newpage = 1,
    mediaType = "all",
  ) => {
    try {
      setLoading(true);
      setResults([]);
      setError(null);

      const res = await API.get("/media/country", {
        params: {
          countryCode,
          page: newpage,
          mediaType,
        },
      });

      if (newpage === 1) {
        setResults(res.data.results);
      } else {
        setResults((prev) => [...prev, ...res.data.results]);
      }

      setPage(newpage);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch media by country");
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaByLanguage = async (
    languageCode,
    newpage = 1,
    mediaType = "all",
  ) => {
    try {
      setLoading(true);
      setResults([]);
      setError(null);

      const res = await API.get("/media/language", {
        params: {
          languageCode,
          page: newpage,
          mediaType,
        },
      });

      if (newpage === 1) {
        setResults(res.data.results);
      } else {
        setResults((prev) => [...prev, ...res.data.results]);
      }

      setPage(newpage);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch media by language");
    } finally {
      setLoading(false);
    }
  };

  const fetchExploreCategory = async (
    category,
    newpage = 1,
    mediaType = "all",
  ) => {
    try {
      setLoading(true);
      setResults([]);
      setError(null);

      const res = await API.get("/media/explore", {
        params: {
          category,
          page: newpage,
          mediaType,
        },
      });

      if (newpage === 1) {
        setResults(res.data.results);
      } else {
        setResults((prev) => [...prev, ...res.data.results]);
      }

      setPage(newpage);
    } catch (error) {
      console.error(error);

      setError("Failed to fetch explore category");
    } finally {
      setLoading(false);
    }
  };

  const searchMedia = async (query) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      const res = await API.get("/media/search", {
        params: { query },
      });
      setSearchResults(res.data);
    } catch (error) {
      setSearchResults([]);
    }
  };

  const fetchHomeSections = async (type = currentType) => {
    try {
      setHomeLoading(true);
      const res = await API.get("/media/home-sections", {
        params: { type },
      });
      setHomeSections(res.data);
      setHomeLoading(false);
    } catch (err) {
      console.error("Failed to fetch home sections", err);
      setHomeLoading(false);
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
    fetchHomeSections(currentType);
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
        fetchMediaByGenre,
        fetchMediaByCountry,
        fetchMediaByLanguage,
        fetchExploreCategory,
        searchMedia,
        searchResults,
        results,
        page,
        homeSections,
        homeLoading,
        fetchHomeSections,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
