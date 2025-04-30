import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginService } from "../services/authService"; // External API call

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user data or token
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login function
  const login = async (email, password) => {
    try {
      const userData = await loginService(email, password); // Call external API
      setUser(userData); // Save user data
      setIsAuthenticated(true); // Mark user as authenticated
      localStorage.setItem("authToken", userData.access_token); // Persist token
    } catch (error) {
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken"); // Clear token
  };
  
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true); // Restore authentication state
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => useContext(AuthContext);