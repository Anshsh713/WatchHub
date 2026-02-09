import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function Protected({ children }) {
  const { status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!status) {
    return <Navigate to="/authpage" replace state={{ from: location }} />;
  }

  return children;
}
