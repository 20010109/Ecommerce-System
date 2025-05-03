import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const RoleBasedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const isSeller = decoded.is_seller === true;
    const userRole = isSeller ? "seller" : "buyer";

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  } catch (err) {
    console.error("Failed to decode token:", err);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RoleBasedRoute;
