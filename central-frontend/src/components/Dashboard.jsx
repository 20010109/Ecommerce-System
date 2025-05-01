import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../services/authService";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to login page
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Welcome to DOMA</h1>
      <p>You are now logged in.</p>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <Link to="/catalog" style={{ color: "var(--color-accent)" }}>
              Go to Product Catalog
            </Link>
          </li>
        </ul>
      </nav>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
