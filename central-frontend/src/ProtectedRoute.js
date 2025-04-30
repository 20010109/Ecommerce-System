// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login/signup page if not authenticated
    return <Navigate to="/" />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute;