import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // ✅ Extract role from Hasura claims
    const userRole =
      decoded["https://hasura.io/jwt/claims"]?.["x-hasura-default-role"];

    console.log("User role:", userRole);  // (optional) for debugging

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
