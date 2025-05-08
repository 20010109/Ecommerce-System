import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./common/Header.css";
import { jwtDecode } from "jwt-decode";
import { FaShoppingCart } from "react-icons/fa";  // Icon for the logo

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
  
      // ✅ Extract the role from Hasura JWT claims
      userRole =
        decoded["https://hasura.io/jwt/claims"]?.["x-hasura-default-role"];
  
      console.log("User role:", userRole);  // Optional debug
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo + Brand */}
        <div className="brand">
          <FaShoppingCart className="brand-icon" />
          <h1 className="header-title">DOMA</h1>
        </div>

        {/* Search bar */}
        <input type="text" className="search-bar" placeholder="Search products..." />

        {/* Nav links */}
        <nav className="navbar">
          {userRole === "buyer" && (
            <>
              <Link to="/catalog">Catalog</Link>
              <Link to="/order">Order</Link>
            </>
          )}

          {userRole === "seller" && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/inventory">Inventory</Link>
              <Link to="/seller/order">Order</Link>
            </>
          )}

          <Link to="/about">About</Link>
          <Link to="/profile">Profile</Link>

          {token && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
