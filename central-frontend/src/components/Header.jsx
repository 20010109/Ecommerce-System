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
  
      userRole =
        decoded["https://hasura.io/jwt/claims"]?.["x-hasura-default-role"];
  
      console.log("User role:", userRole);  // Debug: shows buyer/seller/admin
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");  // Clean up role too if stored
    navigate("/");
  };

  const handleMyShopClick = () => {
    if (userRole === "seller") {
      navigate("/dashboard");  // 🚀 Seller dashboard
    } else {
      navigate("/seller/register");  // 🚀 Register as seller
    }
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
          {token && (
            <>
              {/* Universal: always visible */}
              <Link to="/catalog">Catalog</Link>
              <Link to="/order">Orders</Link>
              <Link to="/about">About</Link>
              <Link to="/profile">Profile</Link>

              {/* Extra tab for sellers */}
              {userRole === "seller" && (
                <Link to="/inventory">Inventory</Link>
              )}

              {/* 🚀 My Shop Button */}
              <button onClick={handleMyShopClick} className="my-shop-button">
                My Shop
              </button>

              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          )}

          {/* If no token: fallback (e.g., maybe Login/Register links) */}
          {!token && (
            <>
              <Link to="/">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
