import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../Services/Axios_api";

const MediaContext = createContext();

export const MediaProvider = ({ children }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentType, setCurrentType] = useState(
    localStorage.getItem("mediaType") || "all",
  );

  const fetchMedia = async (type = currentType) => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/media", {
        params: { type },
      });

      setMedia(res.data.results);
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
        media,
        loading,
        error,
        currentType,
        fetchMedia,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => useContext(MediaContext);
