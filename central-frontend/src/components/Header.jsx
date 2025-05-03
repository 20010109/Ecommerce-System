import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/Header.css";
import { jwtDecode } from "jwt-decode";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  let userRole = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const isSeller = decoded.is_seller === true;
      userRole = isSeller ? "seller" : "buyer";
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
      <div className="header-div">
        <h1 className="header-title">DOMA</h1>

        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
        />

        <div className="navbar-div">
          {/* Buyer Links */}
          {userRole === "buyer" && (
            <>
              <Link to="/catalog" className="tocatalog">Catalog</Link>
              <Link to="/order" className="toorder">Order</Link>
            </>
          )}

          {/* Seller Links */}
          {userRole === "seller" && (
            <>
              <Link to="/dashboard" className="todashboard">Dashboard</Link>
              <Link to="/inventory" className="toinventory">Inventory</Link>
            </>
          )}

          {/* Common Links */}
          <Link to="/about" className="toabout">About</Link>

          {/* Optional: Profile */}
          <Link to="/profile" className="toprofile">Profile</Link>

          {/* Logout button */}
          {token && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
